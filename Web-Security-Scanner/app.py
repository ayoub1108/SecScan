import os
import io
import csv
import json
from datetime import datetime, timedelta
from collections import Counter
from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response, send_file
from models import db, Scan
from scanner_engine import run_information_scan
from io import BytesIO
from xhtml2pdf import pisa
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import multiprocessing

# --- Main Flask App Setup ---
app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance/scans.db')}",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)
db.init_app(app)

# --- Reliable Database Initialization ---
with app.app_context():
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    db.create_all()

# --- Background Task Function ---
def run_scan_in_background(scan_id, database_uri):
    engine = create_engine(database_uri)
    Session = sessionmaker(bind=engine)
    session = Session()
    scan = session.query(Scan).get(scan_id)
    if not scan:
        session.close()
        return
    try:
        print(f"Background process starting scan for ID: {scan_id}, URL: {scan.url}")
        scan_data = run_information_scan(scan.url)
        scan.scan_data = json.dumps(scan_data)
        scan.status = "Completed"
        print(f"Background process finished scan for ID: {scan_id}")
    except Exception as e:
        print(f"Background process ERROR for scan ID {scan_id}: {e}")
        scan.status = "Failed"
        scan.scan_data = json.dumps({"error": str(e), "active_tests": [], "js_libraries": []}) 
    session.commit()
    session.close()

# --- Helper Function for Security Score Calculation ---
def calculate_security_score_and_vulns(scan_data):
    score = 100
    vulns_count = 0
    
    if not scan_data:
        return 0, 0

    if isinstance(scan_data, str):
        try:
            scan_data = json.loads(scan_data)
        except json.JSONDecodeError:
            print("Error decoding scan_data JSON string.")
            return 0, 0

    ssl_info = scan_data.get('ssl', {})
    if ssl_info.get('error'):
        score -= 40
        vulns_count += 1
    elif ssl_info.get('expired'):
        score -= 40
        vulns_count += 1
    
    expected_headers = ["content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"]
    headers_found = [k.lower() for k in scan_data.get('http_headers', {}).keys()]
    
    for header in expected_headers:
        if header not in headers_found:
            if header == "content-security-policy": 
                score -= 15
                vulns_count += 1
            elif header == "strict-transport-security": 
                score -= 15
                vulns_count += 1
            else: 
                vulns_count += 1 

    if 'vulnerabilities' in scan_data:
        vulns_count += len(scan_data['vulnerabilities']) 
        for vuln in scan_data['vulnerabilities']:
            severity = vuln.get('severity')
            if severity == 'Critical': 
                score -= 25 
            elif severity == 'High': 
                score -= 20
            elif severity == 'Medium': 
                score -= 10
            elif severity == 'Low': 
                score -= 5
            
    return max(0, score), vulns_count

# --- Helper function to safely get email security status ---
def get_email_security_status(data):
    """Safely extract email security status, handling both dict and bool values"""
    email_security = data.get('email_security', {})
    
    # Handle case where email_security is a boolean
    if isinstance(email_security, bool):
        return {'spf': {'present': email_security}, 'dmarc': {'present': email_security}}
    
    # Handle case where email_security is a dictionary
    if isinstance(email_security, dict):
        spf = email_security.get('spf', {})
        dmarc = email_security.get('dmarc', {})
        
        # Handle if spf/dmarc are booleans
        if isinstance(spf, bool):
            spf = {'present': spf}
        if isinstance(dmarc, bool):
            dmarc = {'present': dmarc}
            
        return {
            'spf': spf if isinstance(spf, dict) else {'present': False},
            'dmarc': dmarc if isinstance(dmarc, dict) else {'present': False}
        }
    
    return {'spf': {'present': False}, 'dmarc': {'present': False}}

# --- Helper function to sanitize scan data for template ---
def sanitize_scan_data_for_template(data):
    """Completely sanitize scan data to prevent template errors"""
    if not data:
        return {}
    
    # Make a copy to avoid modifying original
    safe_data = dict(data)
    
    # Fix email_security - convert booleans to proper dicts
    if 'email_security' in safe_data:
        email_sec = safe_data['email_security']
        if isinstance(email_sec, bool):
            safe_data['email_security'] = {
                'spf': {'present': email_sec, 'record': 'Present' if email_sec else 'Not found'},
                'dmarc': {'present': email_sec, 'record': 'Present' if email_sec else 'Not found'}
            }
        elif isinstance(email_sec, dict):
            for key in ['spf', 'dmarc']:
                if key in email_sec and isinstance(email_sec[key], bool):
                    safe_data['email_security'][key] = {
                        'present': email_sec[key],
                        'record': 'Present' if email_sec[key] else 'Not found'
                    }
    
    # Ensure subdomains is a dict with a list
    if 'subdomains' not in safe_data:
        safe_data['subdomains'] = {'subdomains': []}
    elif not isinstance(safe_data['subdomains'], dict):
        safe_data['subdomains'] = {'subdomains': []}
    elif 'subdomains' not in safe_data['subdomains']:
        safe_data['subdomains']['subdomains'] = []
    
    # Ensure port_scan is a dict
    if 'port_scan' not in safe_data:
        safe_data['port_scan'] = {'open_ports': []}
    elif not isinstance(safe_data['port_scan'], dict):
        safe_data['port_scan'] = {'open_ports': []}
    
    # Ensure js_libraries is a list
    if 'js_libraries' not in safe_data:
        safe_data['js_libraries'] = []
    elif not isinstance(safe_data['js_libraries'], list):
        safe_data['js_libraries'] = []
    
    # Ensure http_headers is a dict
    if 'http_headers' not in safe_data:
        safe_data['http_headers'] = {}
    
    # Ensure ssl is a dict
    if 'ssl' not in safe_data:
        safe_data['ssl'] = {}
    
    # Ensure cookies is a list
    if 'cookies' not in safe_data:
        safe_data['cookies'] = []
    
    # Ensure active_tests is a list
    if 'active_tests' not in safe_data:
        safe_data['active_tests'] = []
    
    # Ensure vulnerabilities is a list
    if 'vulnerabilities' not in safe_data:
        safe_data['vulnerabilities'] = []
    
    return safe_data

# --- Custom Jinja2 filter ---
@app.template_filter('dict_lower')
def dict_lower_filter(d):
    if not isinstance(d, dict): return d
    return {k.lower(): v for k, v in d.items()}

# --- Routes ---
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        url = request.form.get("url")
        if not url:
            return redirect(url_for('index'))
        
        new_scan = Scan(url=url, status="Pending", timestamp=datetime.utcnow())
        db.session.add(new_scan)
        db.session.commit()
        
        process = multiprocessing.Process(target=run_scan_in_background, args=(new_scan.id, app.config['SQLALCHEMY_DATABASE_URI']))
        process.start()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({"status": "success", "scan_id": new_scan.id, "message": "Scan initiated."})
        return redirect(url_for('index'))

    all_scans = Scan.query.order_by(Scan.id.desc()).all()

    security_score = 0
    previous_security_score = None
    last_completed_scan_url = "N/A"

    completed_scans = Scan.query.filter_by(status="Completed").order_by(Scan.id.desc()).all()
    
    if completed_scans:
        latest_scan_data_parsed = {}
        try:
            latest_scan_data_parsed = json.loads(completed_scans[0].scan_data)
        except (json.JSONDecodeError, TypeError):
            pass 
        
        security_score, _ = calculate_security_score_and_vulns(latest_scan_data_parsed)
        last_completed_scan_url = completed_scans[0].url

        if len(completed_scans) > 1:
            previous_scan_data_parsed = {}
            try:
                previous_scan_data_parsed = json.loads(completed_scans[1].scan_data)
            except (json.JSONDecodeError, TypeError):
                pass
            previous_security_score, _ = calculate_security_score_and_vulns(previous_scan_data_parsed)

    daily_total_scans = Counter()
    daily_vuln_scans = Counter()

    for scan in all_scans:
        scan_date = scan.timestamp.date()
        daily_total_scans[scan_date] += 1
        
        if scan.status == "Completed":
            parsed_data = {}
            try:
                parsed_data = json.loads(scan.scan_data)
            except (json.JSONDecodeError, TypeError):
                pass 
            
            _, vulns_count = calculate_security_score_and_vulns(parsed_data)
            if vulns_count > 0:
                daily_vuln_scans[scan_date] += 1
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=29)

    date_range_labels = []
    total_counts = []
    vuln_counts = []

    current_date = start_date
    while current_date <= end_date:
        date_range_labels.append(current_date.strftime("%b %d"))
        total_counts.append(daily_total_scans[current_date])
        vuln_counts.append(daily_vuln_scans[current_date])
        current_date += timedelta(days=1)

    time_series_chart = { 
        "labels": date_range_labels, 
        "counts": total_counts,
        "vuln_counts": vuln_counts 
    }

    safe_scans_list = []
    vulnerable_scans_set = set() 

    for scan in all_scans:
        if scan.status != "Completed":
            continue

        parsed_data = {}
        try:
            parsed_data = json.loads(scan.scan_data)
        except (json.JSONDecodeError, TypeError):
            pass 

        _, vulns_found_in_scan = calculate_security_score_and_vulns(parsed_data)
        
        if vulns_found_in_scan > 0:
            vulnerable_scans_set.add(scan.url)
        else:
            safe_scans_list.append(scan.url)
            
    stats = {
        "total_scans": len(all_scans),
        "total_scans_list": [s.url for s in all_scans],
        "safe_scans": len(safe_scans_list),
        "safe_scans_list": safe_scans_list,
        "vuln_count": len(vulnerable_scans_set),
        "vulnerable_scans_list": list(vulnerable_scans_set)
    }

    history = []
    for scan in all_scans:
        parsed_data = {}
        try:
            parsed_data = json.loads(scan.scan_data)
        except (json.JSONDecodeError, TypeError):
            pass

        _, vulns_found_for_history = calculate_security_score_and_vulns(parsed_data)

        history.append({
            "id": scan.id,
            "url": scan.url,
            "status": scan.status,
            "time": scan.timestamp.isoformat(), 
            "vulns_found": vulns_found_for_history
        })

    return render_template(
        "index.html",
        history=history,
        stats=stats,
        time_series_chart=time_series_chart,
        security_score=security_score,
        previous_security_score=previous_security_score, 
        last_scan_url=last_completed_scan_url
    )

@app.route("/scan_status/<int:scan_id>")
def scan_status(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    return jsonify({"status": scan.status})

@app.route("/report/<int:scan_id>")
def report(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    if scan.status == "Pending":
        return "This scan is still in progress. Please refresh later.", 202

    # Make sure scan_data is a dictionary
    if isinstance(scan.scan_data, str):
        try:
            scan.scan_data = json.loads(scan.scan_data)
        except json.JSONDecodeError:
            scan.scan_data = {"error": "Invalid scan data format.", "active_tests": []} 
    elif scan.scan_data is None: 
         scan.scan_data = {"error": "No scan data available.", "active_tests": []}
    
    # Sanitize data for template
    scan.scan_data = sanitize_scan_data_for_template(scan.scan_data)

    # --- JS_LIBRARIES SANITIZATION ---
    if 'js_libraries' not in scan.scan_data or not scan.scan_data['js_libraries']:
        scan.scan_data['js_libraries'] = [{
            "library": "N/A",
            "version": "-",
            "severity": "-",
            "summary": "No JavaScript libraries identified or analyzed."
        }]

    # --- HISTORICAL VULNERABILITY TRACKING ---
    delta_report = {"newly_found": [], "resolved": [], "still_present": []}
    
    current_vulnerabilities = scan.scan_data.get('vulnerabilities', [])
    current_vuln_summaries = {vuln.get('summary') for vuln in current_vulnerabilities} 

    previous_scan = Scan.query.filter(
        Scan.url == scan.url,
        Scan.status == "Completed",
        Scan.timestamp < scan.timestamp, 
        Scan.id != scan.id 
    ).order_by(Scan.timestamp.desc()).first()

    if previous_scan and previous_scan.scan_data:
        previous_scan_data_parsed = {}
        if isinstance(previous_scan.scan_data, str):
            try:
                previous_scan_data_parsed = json.loads(previous_scan.scan_data)
            except json.JSONDecodeError:
                pass 
        elif previous_scan.scan_data is not None:
            previous_scan_data_parsed = previous_scan.scan_data
        
        previous_scan_data_parsed = sanitize_scan_data_for_template(previous_scan_data_parsed)
        previous_vulnerabilities = previous_scan_data_parsed.get('vulnerabilities', [])
        previous_vuln_summaries = {vuln.get('summary') for vuln in previous_vulnerabilities}

        for vuln in current_vulnerabilities:
            if vuln.get('summary') not in previous_vuln_summaries:
                delta_report['newly_found'].append(vuln)
            else:
                delta_report['still_present'].append(vuln)
        
        for vuln in previous_vulnerabilities:
            if vuln.get('summary') not in current_vuln_summaries:
                delta_report['resolved'].append(vuln)

    # --- Security Headers Check ---
    HEADER_CHECKS = {
        'Strict-Transport-Security': {},
        'Content-Security-Policy': {},
        'X-Frame-Options': {},
        'X-Content-Type-Options': {},
        'Referrer-Policy': {},
        'Permissions-Policy': {}
    }

    security_headers_status = []
    if scan.scan_data and scan.scan_data.get('http_headers'):
        headers_lower = {k.lower(): v for k, v in scan.scan_data['http_headers'].items()}
        for header in HEADER_CHECKS:
            if header.lower() in headers_lower:
                security_headers_status.append({
                    "name": header,
                    "present": True,
                    "value": headers_lower[header.lower()]
                })
            else:
                security_headers_status.append({
                    "name": header,
                    "present": False,
                    "value": "Missing"
                })

    return render_template(
        "report.html",
        scan=scan, 
        scan_data=scan.scan_data, 
        security_headers=security_headers_status,
        recommendations=scan.scan_data.get("recommendations", []), 
        active_tests=scan.scan_data.get("active_tests", []),
        delta_report=delta_report,
        previous_scan_timestamp=previous_scan.timestamp.isoformat() if previous_scan else None,
        datetime=datetime
    )

@app.route("/download/pdf/<int:scan_id>")
def download_pdf(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    scan_data_for_template = {} 
    if isinstance(scan.scan_data, str):
        try:
            scan_data_for_template = json.loads(scan.scan_data)
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON data for scan ID {scan_id}")
            scan_data_for_template = {} 
    elif scan.scan_data is not None:
        scan_data_for_template = scan.scan_data 
    else: 
        scan_data_for_template = {}

    # Sanitize data for template
    scan_data_for_template = sanitize_scan_data_for_template(scan_data_for_template)

    # --- HISTORICAL VULNERABILITY TRACKING for PDF ---
    delta_report_pdf = {"newly_found": [], "resolved": [], "still_present": []}
    
    current_vulnerabilities_pdf = scan_data_for_template.get('vulnerabilities', [])
    current_vuln_summaries_pdf = {vuln.get('summary') for vuln in current_vulnerabilities_pdf}

    previous_scan_pdf = Scan.query.filter(
        Scan.url == scan.url,
        Scan.status == "Completed",
        Scan.timestamp < scan.timestamp, 
        Scan.id != scan.id
    ).order_by(Scan.timestamp.desc()).first()

    if previous_scan_pdf and previous_scan_pdf.scan_data:
        previous_scan_data_parsed_pdf = {}
        if isinstance(previous_scan_pdf.scan_data, str):
            try:
                previous_scan_data_parsed_pdf = json.loads(previous_scan_pdf.scan_data)
            except json.JSONDecodeError:
                pass 
        elif previous_scan_pdf.scan_data is not None:
            previous_scan_data_parsed_pdf = previous_scan_pdf.scan_data
        
        previous_scan_data_parsed_pdf = sanitize_scan_data_for_template(previous_scan_data_parsed_pdf)
        previous_vulnerabilities_pdf = previous_scan_data_parsed_pdf.get('vulnerabilities', [])
        previous_vuln_summaries_pdf = {vuln.get('summary') for vuln in previous_vulnerabilities_pdf}

        for vuln in current_vulnerabilities_pdf:
            if vuln.get('summary') not in previous_vuln_summaries_pdf:
                delta_report_pdf['newly_found'].append(vuln)
            else:
                delta_report_pdf['still_present'].append(vuln)
        
        for vuln in previous_vulnerabilities_pdf:
            if vuln.get('summary') not in current_vuln_summaries_pdf:
                delta_report_pdf['resolved'].append(vuln)

    data = scan_data_for_template 

    HEADER_CHECKS = { 
        'Strict-Transport-Security': {'severity': 'High', 'explanation': 'Protects against protocol downgrade attacks and cookie hijacking.', 'recommendation': 'Implement HSTS to enforce secure (HTTPS) connections.'}, 
        'Content-Security-Policy': {'severity': 'High', 'explanation': 'Helps prevent Cross-Site Scripting (XSS) and other code injection attacks.', 'recommendation': 'Define a strong CSP to control which resources can be loaded.'}, 
        'X-Frame-Options': {'severity': 'Medium', 'explanation': 'Protects against "clickjacking" attacks by preventing the site from being framed.', 'recommendation': 'Set to "SAMEORIGIN" or "DENY" to prevent framing.'}, 
        'X-Content-Type-Options': {'severity': 'Medium', 'explanation': 'Prevents the browser from MIME-sniffing a response away from the declared content-type.', 'recommendation': 'Set this header to "nosniff".'}, 
        'Referrer-Policy': {'severity': 'Low', 'explanation': 'Controls how much referrer information is sent with requests.', 'recommendation': 'Set a restrictive policy like "strict-origin-when-cross-origin".'}, 
        'Permissions-Policy': {'severity': 'Low', 'explanation': 'Allows control over which browser features can be used on the site.', 'recommendation': 'Define a policy to disable unneeded features (e.g., microphone, camera).'} 
    }
    
    findings, score = [], 100
    
    if data and not data.get('error'):
        headers_lower = {k.lower(): v for k, v in data.get('http_headers', {}).items()}
        
        # SSL Check
        ssl_info = data.get('ssl', {})
        if ssl_info.get('expired'):
            score -= 40
            findings.append({
                'category': 'SSL/TLS', 
                'check': 'Certificate Validity', 
                'status': 'Failed', 
                'severity': 'Critical', 
                'explanation': "The SSL certificate has expired.",
                'recommendation': 'Renew the SSL certificate immediately.'
            })
        
        # Security Headers Check
        for header, details in HEADER_CHECKS.items():
            if header.lower() in headers_lower:
                findings.append({
                    'category': 'Security Header', 
                    'check': header, 
                    'status': 'Present', 
                    'severity': 'Info', 
                    'explanation': details['explanation'], 
                    'recommendation': 'N/A'
                })
            else:
                if details['severity'] == 'High': 
                    score -= 15
                elif details['severity'] == 'Medium': 
                    score -= 10
                elif details['severity'] == 'Low': 
                    score -= 5
                    
                findings.append({
                    'category': 'Security Header', 
                    'check': header, 
                    'status': 'Missing', 
                    'severity': details['severity'], 
                    'explanation': details['explanation'], 
                    'recommendation': details['recommendation']
                })
        
        # Cookies Check
        for cookie in data.get('cookies', []):
            cookie_flags = [f.lower() for f in cookie.get('flags', [])] 
            
            if 'httponly' not in cookie_flags: 
                score -= 5
                findings.append({
                    'category': 'Cookie Security', 
                    'check': f"Cookie '{cookie.get('name', 'unknown')}'", 
                    'status': 'Insecure', 
                    'severity': 'Medium', 
                    'explanation': 'Missing the HttpOnly flag, making it accessible to client-side scripts.', 
                    'recommendation': 'Set the HttpOnly flag to prevent access from JavaScript.'
                })
                
            if 'secure' not in cookie_flags: 
                score -= 5
                findings.append({
                    'category': 'Cookie Security', 
                    'check': f"Cookie '{cookie.get('name', 'unknown')}'", 
                    'status': 'Insecure', 
                    'severity': 'Medium', 
                    'explanation': 'Missing the Secure flag, allowing it to be sent over unencrypted HTTP.', 
                    'recommendation': 'Set the Secure flag to ensure the cookie is only sent over HTTPS.'
                })
        
        # Email Security Check
        email_status = get_email_security_status(data)
        
        if not email_status['spf'].get('present', False):
            score -= 5
            findings.append({
                'category': 'Email Security', 
                'check': 'SPF Record', 
                'status': 'Missing', 
                'severity': 'Low', 
                'explanation': 'Sender Policy Framework (SPF) helps prevent email spoofing.', 
                'recommendation': 'Create a valid SPF record in your DNS settings.'
            })
        
        if not email_status['dmarc'].get('present', False):
            score -= 5
            findings.append({
                'category': 'Email Security', 
                'check': 'DMARC Record', 
                'status': 'Missing', 
                'severity': 'Medium', 
                'explanation': 'DMARC protects against phishing and spoofing attacks.', 
                'recommendation': 'Create a DMARC record and define a policy (e.g., p=quarantine).'
            })
        
        # Vulnerabilities from scan
        for vuln in data.get('vulnerabilities', []): 
            category = vuln.get('type', 'General Vulnerability')
            check = vuln.get('summary', 'Details not available')
            severity = vuln.get('severity', 'Unknown')
            recommendation = vuln.get('recommendation', 'Consult security best practices for this vulnerability type.')
            
            if severity == 'High': 
                score -= 20
            elif severity == 'Medium': 
                score -= 10
            elif severity == 'Low': 
                score -= 5

            findings.append({
                'category': category,
                'check': check,
                'status': 'Found',
                'severity': severity,
                'explanation': vuln.get('summary', 'N/A'), 
                'recommendation': recommendation
            })

    # Calculate security score
    security_score = max(0, score)
    
    # Determine risk level
    if security_score < 40: 
        risk_level = "Critical"
    elif security_score < 70: 
        risk_level = "High"
    elif security_score < 90: 
        risk_level = "Medium"
    else: 
        risk_level = "Low"
    
    # Extract key findings and recommendations
    key_findings = []
    for f in findings:
        if f.get('status') != 'Present' and f.get('severity') in ['Critical', 'High']:
            key_findings.append(f)
    
    # Get unique recommendations
    recommendations_set = set()
    for f in key_findings:
        rec = f.get('recommendation')
        if rec and rec != 'N/A':
            recommendations_set.add(rec)
    
    recommendations = sorted(list(recommendations_set))

    active_tests_pdf = data.get("active_tests", []) 

    rendered_html = render_template(
        "pdf_report_template.html",
        scan=scan,
        scan_data=scan_data_for_template, 
        security_score=security_score,
        risk_level=risk_level,
        findings=findings,
        key_findings=key_findings,
        recommendations=recommendations,
        active_tests=active_tests_pdf,
        delta_report=delta_report_pdf, 
        previous_scan_timestamp=previous_scan_pdf.timestamp.isoformat() if previous_scan_pdf else None, 
        datetime=datetime
    )
    
    pdf_file = BytesIO()
    pisa.CreatePDF(rendered_html, dest=pdf_file)
    pdf_file.seek(0)
    safe_filename = f"CRAW_Security_Report_{scan.id}.pdf"
    return send_file(pdf_file, as_attachment=True, download_name=safe_filename, mimetype='application/pdf')

@app.route("/download/csv/<int:scan_id>")
def download_csv(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    data = {}
    if isinstance(scan.scan_data, str):
        try:
            data = json.loads(scan.scan_data)
        except json.JSONDecodeError:
            pass 
    elif scan.scan_data is not None:
        data = scan.scan_data
    
    data = sanitize_scan_data_for_template(data)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Category", "Issue", "Details", "Severity", "Recommendation"]) 

    HEADER_CHECKS = { 
        'Strict-Transport-Security': {'severity': 'High', 'explanation': 'Protects against protocol downgrade attacks and cookie hijacking.', 'recommendation': 'Implement HSTS to enforce secure (HTTPS) connections.'}, 
        'Content-Security-Policy': {'severity': 'High', 'explanation': 'Helps prevent Cross-Site Scripting (XSS) and other code injection attacks.', 'recommendation': 'Define a strong CSP to control which resources can be loaded.'}, 
        'X-Frame-Options': {'severity': 'Medium', 'explanation': 'Protects against "clickjacking" attacks by preventing the site from being framed.', 'recommendation': 'Set to "SAMEORIGIN" or "DENY" to prevent framing.'}, 
        'X-Content-Type-Options': {'severity': 'Medium', 'explanation': 'Prevents the browser from MIME-sniffing a response away from the declared content-type.', 'recommendation': 'Set this header to "nosniff".'}, 
        'Referrer-Policy': {'severity': 'Low', 'explanation': 'Controls how much referrer information is sent with requests.', 'recommendation': 'Set a restrictive policy like "strict-origin-when-cross-origin".'}, 
        'Permissions-Policy': {'severity': 'Low', 'explanation': 'Allows control over which browser features can be used on the site.', 'recommendation': 'Define a policy to disable unneeded features (e.g., microphone, camera).'} 
    }

    if data.get('ssl', {}).get('expired'):
        writer.writerow(["SSL", "Certificate Expired", "Certificate has expired", "Critical", "Renew the SSL certificate immediately."])
    
    headers_lower = {k.lower(): v for k, v in data.get('http_headers', {}).items()}
    for header, details in HEADER_CHECKS.items():
        if header.lower() not in headers_lower:
            writer.writerow(["Security Header", "Missing", header, details['severity'], details['recommendation']])
            
    for cookie in data.get('cookies', []):
        if 'httponly' not in [f.lower() for f in cookie.get('flags', [])]:
            writer.writerow(["Cookie Security", f"Cookie '{cookie.get('name', 'unknown')}'", "Missing HttpOnly flag", "Medium", "Set the HttpOnly flag to prevent access from JavaScript."])
        if 'secure' not in [f.lower() for f in cookie.get('flags', [])]:
            writer.writerow(["Cookie Security", f"Cookie '{cookie.get('name', 'unknown')}'", "Missing Secure flag", "Medium", "Set the Secure flag to ensure the cookie is only sent over HTTPS."])
    
    email_status = get_email_security_status(data)
    
    if not email_status['spf'].get('present', False):
        writer.writerow(["Email Security", "SPF Record", "Missing", "Low", "Create a valid SPF record in your DNS settings."])
    if not email_status['dmarc'].get('present', False):
        writer.writerow(["Email Security", "DMARC Record", "Missing", "Medium", "Create a DMARC record and define a policy (e.g., p=quarantine)."])

    for vuln in data.get('vulnerabilities', []):
        writer.writerow([
            vuln.get('type', 'General'),
            vuln.get('summary', 'N/A'),
            vuln.get('details', 'No further details.'), 
            vuln.get('severity', 'Unknown'),
            vuln.get('recommendation', 'No specific recommendation provided.')
        ])

    output.seek(0)
    safe_filename = f"scan_report_{scan.id}.csv"
    return make_response(output.getvalue(), 200, {"Content-Disposition": f"attachment; filename={safe_filename}", "Content-Type": "text/csv"})

@app.route("/download/json/<int:scan_id>")
def download_json(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    data_to_jsonify = {}
    if isinstance(scan.scan_data, str):
        try:
            data_to_jsonify = json.loads(scan.scan_data)
        except json.JSONDecodeError:
            data_to_jsonify = {"error": "Invalid scan data format in database."}
    elif scan.scan_data is not None:
        data_to_jsonify = scan.scan_data
    
    data_to_jsonify = sanitize_scan_data_for_template(data_to_jsonify)
    return make_response(jsonify(data_to_jsonify))

@app.route("/api/ai-insights/<int:scan_id>")
def get_ai_insights(scan_id):
    """Get AI analysis insights for a scan"""
    scan = Scan.query.get_or_404(scan_id)
    
    if scan.status != "Completed":
        return jsonify({"error": "Scan not completed yet"}), 202
    
    # Parse scan data
    if isinstance(scan.scan_data, str):
        scan_data = json.loads(scan.scan_data)
    else:
        scan_data = scan.scan_data or {}
    
    scan_data = sanitize_scan_data_for_template(scan_data)
    
    ai_analysis = scan_data.get('ai_analysis', {})
    remediation = scan_data.get('ai_remediation_plan', '')
    vulnerabilities = scan_data.get('vulnerabilities', [])
    
    return jsonify({
        "scan_id": scan_id,
        "url": scan.url,
        "ai_assessment": ai_analysis.get('overall_assessment', 'No AI assessment available'),
        "risk_score": ai_analysis.get('risk_score', 'N/A'),
        "vulnerability_counts": {
            "critical": ai_analysis.get('critical_count', 0),
            "high": ai_analysis.get('high_count', 0),
            "medium": ai_analysis.get('medium_count', 0),
            "low": ai_analysis.get('low_count', 0)
        },
        "remediation_plan": remediation,
        "total_vulnerabilities": len(vulnerabilities)
    })

# --- Main Block ---
if __name__ == '__main__':
    multiprocessing.freeze_support()
    app.run(debug=True)
# scanner_engine.py - Complete working version with AI remediation

import whois
import dns.resolver
import ssl
import socket
import subprocess
from datetime import datetime
from urllib.parse import urlparse
import requests
import builtwith
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

# --- Helper function ---
def get_domain_from_url(url):
    try:
        if '://' not in url:
            url = 'http://' + url
        return urlparse(url).netloc
    except Exception:
        return None

# --- Subdomain Enumeration ---
def get_subdomains(domain):
    url = f"https://crt.sh/?q=%25.{domain}&output=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        subdomains = set()
        for item in data:
            name = item.get("name_value")
            if name:
                for sub in name.split('\n'):
                    if sub.strip().endswith(domain) and '*' not in sub:
                        subdomains.add(sub.strip().lower())
        return {"subdomains": sorted(list(subdomains))}
    except Exception as e:
        return {"error": f"Subdomain enumeration failed: {str(e)}"}

# --- WHOIS Lookup ---
def get_whois_info(domain):
    try:
        info = whois.whois(domain)
        return {
            "registrar": str(info.registrar) if info.registrar else None,
            "creation_date": str(info.creation_date) if info.creation_date else None,
            "expiration_date": str(info.expiration_date) if info.expiration_date else None,
            "name_servers": info.name_servers if info.name_servers else []
        }
    except Exception as e:
        return {"error": f"WHOIS lookup failed: {str(e)}"}

# --- DNS Records ---
def get_dns_records(domain):
    records = {}
    record_types = ['A', 'AAAA', 'MX', 'TXT', 'NS']
    for record_type in record_types:
        try:
            answers = dns.resolver.resolve(domain, record_type)
            records[record_type] = [str(rdata) for rdata in answers]
        except:
            records[record_type] = []
    return records

# --- SSL Certificate ---
def get_ssl_info(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                from datetime import datetime
                expires_dt = datetime.strptime(cert.get('notAfter'), '%b %d %H:%M:%S %Y %Z')
                return {
                    "issuer": dict(x[0] for x in cert.get('issuer', [])),
                    "subject": dict(x[0] for x in cert.get('subject', [])),
                    "expires": expires_dt.strftime('%Y-%m-%d %H:%M:%S %Z'),
                    "expired": expires_dt < datetime.now(),
                    "valid": True
                }
    except Exception as e:
        return {"error": str(e), "valid": False, "expired": True}

# --- Port Scan ---
def perform_port_scan(hostname):
    open_ports = []
    common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 3389, 5432, 8080, 8443]
    try:
        ip = socket.gethostbyname(hostname)
        for port in common_ports:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.settimeout(1)
                    if s.connect_ex((ip, port)) == 0:
                        open_ports.append(f"{port}/tcp")
            except:
                continue
        return {"open_ports": open_ports if open_ports else "None found", "method": "basic"}
    except Exception as e:
        return {"open_ports": "None found", "error": str(e), "method": "basic"}

# --- Wayback Machine ---
def get_wayback_snapshots(url):
    try:
        domain = urlparse(url).netloc
        response = requests.get("https://archive.org/wayback/available", params={"url": domain}, timeout=10)
        data = response.json()
        snapshot = data.get("archived_snapshots", {}).get("closest", {})
        if snapshot and snapshot.get("available"):
            return {"status": "Available", "timestamp": snapshot.get("timestamp"), "url": snapshot.get("url")}
        return {"status": "No snapshots found"}
    except Exception as e:
        return {"error": str(e)}

# --- Cookie Analysis ---
def analyze_cookies(headers):
    cookies = []
    if 'Set-Cookie' in headers:
        cookie_headers = headers.get('Set-Cookie', '')
        if isinstance(cookie_headers, str):
            cookie_headers = [cookie_headers]
        for cookie_header in cookie_headers:
            cookie_info = {
                'name': cookie_header.split('=')[0] if '=' in cookie_header else 'unknown',
                'flags': []
            }
            if 'Secure' in cookie_header:
                cookie_info['flags'].append('Secure')
            if 'HttpOnly' in cookie_header:
                cookie_info['flags'].append('HttpOnly')
            cookies.append(cookie_info)
    return cookies

# --- Email Security ---
def analyze_email_security(domain, dns_records):
    email_security = {'spf': {'present': False, 'record': 'Not found'}, 'dmarc': {'present': False, 'record': 'Not found'}}
    for record in dns_records.get('TXT', []):
        if str(record).lower().startswith('v=spf1'):
            email_security['spf']['present'] = True
            email_security['spf']['record'] = str(record)
            break
    try:
        dns.resolver.resolve(f'_dmarc.{domain}', 'TXT')
        email_security['dmarc']['present'] = True
        email_security['dmarc']['record'] = 'Found'
    except:
        pass
    return email_security

# --- Fallback Remediation Plan ---
def build_fallback_plan(vulnerabilities):
    """Static fallback plan when AI is unavailable"""
    if not vulnerabilities:
        return "✅ No vulnerabilities detected. Your site appears secure!"
    
    severity_order = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}
    sorted_vulns = sorted(vulnerabilities, key=lambda v: severity_order.get(v.get('severity', 'Low'), 3))

    plan = ""
    
    # Critical section
    critical = [v for v in sorted_vulns if v.get('severity') == 'Critical']
    if critical:
        plan += "## 🚨 CRITICAL - Fix Within 24 Hours\n\n"
        plan += f"**What's happening:** {critical[0].get('explanation', 'Critical security issues detected.')}\n\n"
        for i, v in enumerate(critical[:3], 1):
            fix = v.get('recommendation', v.get('summary', 'Review and fix this issue'))
            plan += f"- Step {i}: {fix}\n"
        plan += "\n⏱️ Estimated time: 2-4 hours\n\n---\n\n"
    
    # High section
    high = [v for v in sorted_vulns if v.get('severity') == 'High']
    if high:
        plan += "## ⚠️ HIGH PRIORITY - Fix Within 1 Week\n\n"
        plan += f"**What's happening:** {high[0].get('explanation', 'High-severity issues require attention.')}\n\n"
        for i, v in enumerate(high[:3], 1):
            fix = v.get('recommendation', v.get('summary', 'Review and fix this issue'))
            plan += f"- Step {i}: {fix}\n"
        plan += "\n⏱️ Estimated time: 1-2 days\n\n---\n\n"
    
    # Medium section
    medium = [v for v in sorted_vulns if v.get('severity') == 'Medium']
    if medium:
        plan += "## 📌 MEDIUM PRIORITY - Fix Within 2 Weeks\n\n"
        for v in medium[:3]:
            fix = v.get('recommendation', v.get('summary', 'Review this issue'))
            plan += f"- {fix}\n"
        plan += "\n⏱️ Estimated time: 2-3 hours\n\n---\n\n"
    
    # Quick wins (Low severity)
    low = [v for v in sorted_vulns if v.get('severity') == 'Low']
    if low:
        plan += "## ⚡ QUICK WINS - Under 1 Hour\n\n"
        for v in low[:4]:
            fix = v.get('recommendation', v.get('summary', 'Fix this issue'))
            plan += f"- {fix}\n"
        plan += "\n⏱️ Estimated time: 15-30 minutes"
    
    if not plan:
        plan = "## ✅ No critical issues found\n\nContinue regular security monitoring and keep software updated."
    
    return plan

# --- Main Scan Function ---
def run_information_scan(url):
    """Main scanning function - runs all security checks"""
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    domain = get_domain_from_url(url)
    if not domain:
        return {"error": "Invalid URL", "status": "Failed", "timestamp": datetime.now().isoformat()}
    
    print(f"🔍 Starting scan for: {domain}")
    
    scan_data = {
        "url": url,
        "domain": domain,
        "timestamp": datetime.now().isoformat(),
        "status": "Completed",
        "active_tests": [],
        "vulnerabilities": [],
        "findings": [],
        "recommendations": [],
        "http_headers": {},
        "tech_stack": {},
        "whois": {},
        "dns": {},
        "ssl": {},
        "email_security": {},
        "wayback": {},
        "port_scan": {},
        "subdomains": {},
        "cookies": [],
        "js_libraries": []
    }
    
    # HTTP Request
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15, allow_redirects=True)
        scan_data['http_headers'] = dict(response.headers)
        scan_data['cookies'] = analyze_cookies(response.headers)
        
        # Check security headers
        expected_headers = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options", 
                           "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]
        headers_lower = {k.lower(): v for k, v in scan_data['http_headers'].items()}
        missing_headers = [h for h in expected_headers if h.lower() not in headers_lower]
        if missing_headers:
            for h in missing_headers:
                scan_data['vulnerabilities'].append({
                    "type": "Missing Security Header",
                    "severity": "Medium" if h in ["Strict-Transport-Security", "Content-Security-Policy"] else "Low",
                    "summary": f"Missing {h} header",
                    "explanation": f"This header helps protect against various web attacks",
                    "recommendation": f"Add the {h} header to your HTTP responses"
                })
    except Exception as e:
        scan_data['findings'].append(f"Could not fetch website: {e}")
    
    # Subdomains
    sub_result = get_subdomains(domain)
    scan_data['subdomains'] = sub_result
    
    # WHOIS
    scan_data['whois'] = get_whois_info(domain)
    
    # DNS
    scan_data['dns'] = get_dns_records(domain)
    
    # SSL
    ssl_info = get_ssl_info(domain)
    scan_data['ssl'] = ssl_info
    if not ssl_info.get('valid'):
        scan_data['vulnerabilities'].append({
            "type": "SSL/TLS Issue",
            "severity": "Critical",
            "summary": "SSL certificate is invalid or expired",
            "explanation": "Your website connection is not secure. Visitors will see security warnings.",
            "recommendation": "Renew or fix your SSL certificate immediately"
        })
    
    # Email Security
    email_sec = analyze_email_security(domain, scan_data['dns'])
    scan_data['email_security'] = email_sec
    if not email_sec['spf']['present']:
        scan_data['vulnerabilities'].append({
            "type": "Email Security",
            "severity": "Low",
            "summary": "Missing SPF record",
            "explanation": "Attackers can send fake emails from your domain",
            "recommendation": "Create an SPF record in your DNS settings"
        })
    if not email_sec['dmarc']['present']:
        scan_data['vulnerabilities'].append({
            "type": "Email Security",
            "severity": "Medium",
            "summary": "Missing DMARC record",
            "explanation": "No protection against email phishing attacks",
            "recommendation": "Add a DMARC record to prevent phishing"
        })
    
    # Port Scan
    scan_data['port_scan'] = perform_port_scan(domain)
    
    # Wayback
    scan_data['wayback'] = get_wayback_snapshots(url)
    
    # Generate recommendations list
    for vuln in scan_data['vulnerabilities']:
        if vuln.get('recommendation'):
            scan_data['recommendations'].append(vuln['recommendation'])
    scan_data['recommendations'] = list(set(scan_data['recommendations']))[:10]

    # Generate AI Remediation Plan
    print("🤖 Generating AI remediation plan...")
    try:
        from ai_security_analyzer import AISecurityAnalyzer
        ai = AISecurityAnalyzer()
        if ai.available and scan_data['vulnerabilities']:
            scan_data['ai_remediation_plan'] = ai.generate_remediation_plan(scan_data['vulnerabilities'])
            print(f"✅ AI remediation plan generated")
        elif not scan_data['vulnerabilities']:
            scan_data['ai_remediation_plan'] = "✅ No vulnerabilities detected. Your site appears secure!"
        else:
            scan_data['ai_remediation_plan'] = build_fallback_plan(scan_data['vulnerabilities'])
    except Exception as e:
        print(f"⚠️ AI failed, using fallback: {e}")
        scan_data['ai_remediation_plan'] = build_fallback_plan(scan_data['vulnerabilities'])
    
    # Ensure field exists
    if 'ai_remediation_plan' not in scan_data:
        scan_data['ai_remediation_plan'] = build_fallback_plan(scan_data.get('vulnerabilities', []))

    print(f"✅ Scan completed! Found {len(scan_data['vulnerabilities'])} vulnerabilities")
    return scan_data

# For testing
if __name__ == "__main__":
    test_url = input("Enter URL to scan: ")
    results = run_information_scan(test_url)
    print(json.dumps(results, indent=2))
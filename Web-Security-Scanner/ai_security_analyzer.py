# ai_security_analyzer.py - COMPLETELY FIXED

import json
import os
import re
from typing import Dict, List, Any
from datetime import datetime
import requests
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AISecurityAnalyzer:
    """AI-powered security analyzer using Groq LLM"""
    
    def __init__(self):
        """Initialize Groq client"""
        self.api_key = os.getenv("GROQ_API_KEY")
        
        if not self.api_key:
            print("⚠️ Warning: GROQ_API_KEY not found in environment variables")
            print("Please set it in .env file or export it")
            self.available = False
            return
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"
        self.available = True
        print("✅ AI Security Analyzer initialized with Groq")
    
    def analyze_http_response(self, url: str, response_text: str, headers: Dict) -> Dict:
        """Use AI to analyze HTTP response for vulnerabilities"""
        
        if not self.available:
            return self._get_fallback_analysis()
        
        truncated_text = response_text[:8000] if len(response_text) > 8000 else response_text
        
        prompt = f"""You are a security expert. Analyze this HTTP response for vulnerabilities.

URL: {url}

Response Headers:
{json.dumps(headers, indent=2)}

Response Body (first 5000 chars):
{truncated_text}

Return JSON with this structure:
{{
    "vulnerabilities": [
        {{
            "type": "vulnerability_type",
            "severity": "Critical|High|Medium|Low|Info",
            "confidence": "0-100",
            "summary": "Short title (max 8 words)",
            "what_this_means": "Simple explanation of the risk (15-25 words)",
            "how_to_fix": "What to do to fix it (15-25 words)",
            "location": "header/body/parameter"
        }}
    ],
    "overall_assessment": "One sentence summary",
    "risk_score": "0-100",
    "critical_issues_count": 0,
    "high_issues_count": 0,
    "medium_issues_count": 0,
    "low_issues_count": 0
}}

Only return valid JSON, no markdown."""

        try:
            print("🧠 Sending request to Groq AI...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a security expert. Return ONLY valid JSON. No markdown."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content
            print(f"✅ AI analysis complete")
            
            # Clean response
            result_text = result_text.strip()
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            result = json.loads(result_text)
            return result
            
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            return self._get_fallback_analysis()
    
    def generate_remediation_plan(self, vulnerabilities: List[Dict]) -> str:
        """Generate a clean, well-formatted remediation plan"""
        
        if not self.available or not vulnerabilities:
            return "No vulnerabilities detected or AI unavailable."
        
        prompt = f"""Create a simple, clean remediation plan for these vulnerabilities:

Vulnerabilities:
{json.dumps(vulnerabilities, indent=2)}

Format EXACTLY like this (clean, no markdown, simple sentences):

🚨 CRITICAL - Fix Within 24 Hours

What's happening: Your SSL certificate is expired. Customer data is exposed.

Fix steps:
1. Check your current SSL certificate expiration date
2. Purchase or renew SSL certificate from a trusted CA
3. Install the new certificate on your web server
4. Verify installation with SSL Labs testing tool

Time: 2-4 hours

---

⚠️ HIGH PRIORITY - Fix Within 1 Week

What's happening: Missing DMARC record allows email phishing attacks.

Fix steps:
1. Create a DMARC record with policy "p=quarantine"
2. Add the record to your DNS as _dmarc.yourdomain.com
3. Monitor DMARC reports to verify implementation

Time: 1-2 days

---

📌 MEDIUM PRIORITY - Fix Within 2 Weeks

What's happening: Missing SPF record allows email spoofing.

Fix steps:
1. Identify all authorized mail servers for your domain
2. Create SPF record "v=spf1 mx include:provider.com ~all"
3. Add as TXT record in your DNS settings

Time: 2-3 hours

---

⚡ QUICK WINS - Under 1 Hour

Fix steps:
1. Add Content-Security-Policy header to prevent XSS attacks
2. Enable HSTS (Strict-Transport-Security) header
3. Set X-Frame-Options to DENY or SAMEORIGIN
4. Configure secure flags on cookies

Time: 15-30 minutes each

Rules:
- Use the exact format above with emojis
- Each "What's happening" sentence max 15 words
- Each step max 10 words
- Only include sections relevant to the actual vulnerabilities
- NO markdown formatting (no **, no ##)
- Use simple, clear language"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You create simple, clean remediation plans. Use emojis, short sentences. NO markdown formatting. Just plain text with line breaks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1200
            )
            
            result = response.choices[0].message.content
            # Clean any remaining markdown
            result = result.replace('**', '').replace('##', '').replace('*', '')
            print(f"✅ Remediation plan generated: {len(result)} chars")
            return result
            
        except Exception as e:
            print(f"❌ Remediation plan error: {e}")
            return self._get_fallback_remediation_plan()
    
    def _get_fallback_remediation_plan(self) -> str:
        """Fallback plan when AI fails"""
        return """🚨 CRITICAL - Fix Within 24 Hours

What's happening: SSL certificate issues detected. Your website is not secure.

Fix steps:
1. Check your SSL certificate expiration date
2. Renew or replace expired certificates
3. Install the new certificate on your server
4. Test with SSL Labs

Time: 2-4 hours

---

⚠️ HIGH PRIORITY - Fix Within 1 Week

What's happening: Security headers are missing from your website.

Fix steps:
1. Add Content-Security-Policy header
2. Add Strict-Transport-Security header
3. Add X-Frame-Options header
4. Test headers with securityheaders.com

Time: 1-2 hours

---

⚡ QUICK WINS - Under 1 Hour

Fix steps:
1. Enable HTTPS redirect
2. Set secure cookie flags
3. Remove version information from headers
4. Disable directory listing

Time: 30 minutes"""
    
    def _get_fallback_analysis(self) -> Dict:
        """Fallback when AI is unavailable"""
        return {
            "vulnerabilities": [],
            "overall_assessment": "AI analysis unavailable - check API key configuration",
            "risk_score": "0",
            "critical_issues_count": 0,
            "high_issues_count": 0,
            "medium_issues_count": 0,
            "low_issues_count": 0
        }


if __name__ == "__main__":
    print("Testing AI Security Analyzer...")
    ai = AISecurityAnalyzer()
    
    if ai.available:
        test_result = ai.analyze_http_response(
            "https://example.com",
            "<html><body>Test page</body></html>",
            {"Server": "Apache", "Content-Type": "text/html"}
        )
        print(json.dumps(test_result, indent=2))
    else:
        print("AI not available. Check your GROQ_API_KEY in .env file")
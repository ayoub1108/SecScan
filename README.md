# SecScan - Complete Security Testing Toolkit

![Security Toolkit](https://img.shields.io/badge/Security-Toolkit-red)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Overview
<img width="682" height="1170" alt="Untitled Diagram drawio (1)" src="https://github.com/user-attachments/assets/2e3c1396-7371-40cc-9255-017c53cbd41c" />


**SecScan** is an all-in-one security testing toolkit designed for penetration testers, security researchers, and developers. It combines multiple security scanning tools into a unified platform with both CLI and GUI interfaces.

## ✨ Features

### 🔐 Web Security Scanner
- SQL Injection detection
- XSS vulnerability scanning
- CSRF testing
- Directory enumeration
- Subdomain discovery
- SSL/TLS analysis

### 🤖 Agentic Security
- Automated penetration testing
- Intelligent attack vector identification
- Machine learning-based threat detection
- Custom attack scripts

### 💾 Database Tools
- Database vulnerability scanning
- SQL injection automation
- Database enumeration
- Secure configuration checking

### 🖥️ Frontend Dashboard
- Real-time scan monitoring
- Interactive reports
- Vulnerability management
- Export results (PDF/HTML/JSON)

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 14+ (for frontend)
- npm or yarn
- Git

## 🔧 Installation

### Quick Install
```bash
# Clone the repository
git clone https://github.com/ayoub1108/SecScan.git
cd SecScan

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Docker Installation
```bash
docker build -t secscan .
docker run -p 5000:5000 secscan
```

## 🚦 Quick Start

### Start the Toolkit
```bash
# Run the main launcher
python start.py

# Or start specific modules
python Web-Security-Scanner/main.py
python database/database_api.py
```

### Access Web Interface
```
http://localhost:3000
```

## 📖 Usage Examples

### Web Scanner
```bash
python Web-Security-Scanner/scanner.py -u https://example.com -a full
```

### Database Scanner
```bash
python database/database_api.py --host localhost --port 3306 --scan
```

## 🏗️ Project Structure

```
SecScan/
├── Web-Security-Scanner/     # Web vulnerability scanner
├── agentic-security/         # AI-powered security agent
├── database/                  # Database security tools
├── frontend/                  # React dashboard
├── public/                    # Static assets
├── start.py                   # Main launcher
├── package.json               # Frontend dependencies
└── .gitignore                 # Git ignore rules
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

**This tool is for educational and authorized security testing only.** 
Users are responsible for complying with all applicable laws and regulations.
Unauthorized scanning of networks or systems is illegal.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

- **Creator:** Ayoub
- **GitHub:** [@ayoub1108](https://github.com/ayoub1108)
- **Project Link:** [https://github.com/ayoub1108/SecScan](https://github.com/ayoub1108/SecScan)

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub!

---

**Made with 🔥 for the security community**

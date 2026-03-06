# Vulnerability Sample Collection

This directory contains a collection of code samples that demonstrate common security vulnerabilities across different programming languages, frameworks, and technologies. These samples are designed to be detected by security scanners like the Agentic Security Scanner, but they are intentionally isolated and **do not affect the actual security of the application** when deployed.

## Purpose

These sample files serve several important purposes:

1. **Scanner Testing**: They provide known vulnerabilities for testing the detection capabilities of the security scanner
2. **Demonstration**: They showcase the types of issues the scanner can identify
3. **Education**: They illustrate common security anti-patterns and their remediation
4. **Development**: They assist in improving the scanner's detection algorithms

## Vulnerability Severity Levels

The samples are organized by severity level:

### Critical Vulnerabilities

Files demonstrating the most severe security issues that require immediate attention:

- `sql_injection.py` - SQL injection vulnerability in Python
- `insecure_upload.php` - Unrestricted file upload in PHP
- `credentials_example.js` - Hardcoded credentials in JavaScript

### High Vulnerabilities

Files containing serious security flaws:

- `command_injection.rb` - Command injection vulnerability in Ruby
- `path_traversal.js` - Path traversal vulnerability in Node.js
- `xss_example.jsx` - Cross-site scripting vulnerability in React

### Medium Vulnerabilities

Files with moderate severity issues:

- `insecure_cookie.ts` - Insecure cookie configuration in TypeScript
- `weak_crypto.py` - Weak cryptographic implementation in Python
- `insecure_docker.Dockerfile` - Insecure Docker configuration

### Low Vulnerabilities

Files with minor security concerns:

- `insecure_config.yaml` - Insecure configuration in YAML
- `vulnerable_deps.json` - Outdated dependencies in package.json
- `sensitive_data.tf` - Potentially sensitive information in Terraform

## Usage Notes

1. **Do not use in production**: These examples intentionally contain vulnerabilities and should never be used in production code
2. **Educational purpose**: Use these examples to learn about security vulnerabilities and how to avoid them
3. **Scanner calibration**: These files can be used to calibrate security scanners and verify detection capabilities

## Example Remediation

Each file includes comments showing both the vulnerable code and the proper secure implementation.

## Contributing

To add a new vulnerability example:

1. Create a new file with a descriptive name indicating the vulnerability type
2. Include detailed comments explaining the vulnerability
3. Provide the vulnerable code example
4. Include commented-out remediation code showing the proper secure implementation

## Security Notice

While these files contain vulnerable code, they are isolated examples that do not compromise the security of the application when deployed. They are strictly for educational and testing purposes.

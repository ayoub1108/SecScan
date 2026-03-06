
#!/bin/bash
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do

# Medium: Hardcoded credentials in script
DB_USER="admin"
DB_PASSWORD="super_secret_password"
API_TOKEN="1234567890abcdef1234567890abcdef"

# Low: Insecure curl command
echo "Connecting to API..."
curl -k https://api.example.com/v1/data

# High: Command injection vulnerability
echo "Enter database name:"
read DB_NAME
eval "mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME"

# Critical: Insecure permission setting
echo "Setting up permissions..."
chmod 777 /var/www/html

# Medium: Downloading scripts from external sources without verification
echo "Getting dependencies..."
curl -s http://example.com/scripts/setup.sh | bash

echo "Deployment completed"

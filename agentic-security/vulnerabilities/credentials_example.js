
// EXAMPLE: DO NOT USE IN PRODUCTION
// This is a demonstration file showing what NOT to do

// Critical: Hardcoded AWS credentials
const awsConfig = {
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region: 'us-west-2'
};

// High: Hardcoded database credentials
const dbConnection = {
  user: 'admin',
  password: 'password123',
  host: 'localhost',
  database: 'production_db'
};

function connectToServices() {
  console.log('Connecting to AWS and database...');
  // Simulation of connections
  return true;
}

module.exports = { connectToServices };

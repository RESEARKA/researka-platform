const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('Updating .env file with testnet contract addresses...');

  // Check if .env.testnet exists
  const testnetEnvPath = path.join(__dirname, '../.env.testnet');
  if (!fs.existsSync(testnetEnvPath)) {
    console.error('.env.testnet file not found. Please deploy contracts to testnet first.');
    process.exit(1);
  }

  // Read .env.testnet file
  const testnetEnv = fs.readFileSync(testnetEnvPath, 'utf8');
  
  // Read current .env file
  const envPath = path.join(__dirname, '../.env');
  let currentEnv = '';
  
  if (fs.existsSync(envPath)) {
    currentEnv = fs.readFileSync(envPath, 'utf8');
  }

  // Parse current .env file into key-value pairs
  const envVars = {};
  if (currentEnv) {
    currentEnv.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
  }

  // Parse .env.testnet file and update envVars
  testnetEnv.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });

  // Convert envVars back to string
  let newEnv = '';
  Object.entries(envVars).forEach(([key, value]) => {
    newEnv += `${key}=${value}\n`;
  });

  // Write updated .env file
  fs.writeFileSync(envPath, newEnv);
  console.log('.env file updated with testnet contract addresses.');

  // Display the updated contract addresses
  console.log('\nTestnet Contract Addresses:');
  console.log(`Token: ${envVars.NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS}`);
  console.log(`Treasury: ${envVars.NEXT_PUBLIC_TESTNET_TREASURY_ADDRESS}`);
  console.log(`Submission: ${envVars.NEXT_PUBLIC_TESTNET_SUBMISSION_ADDRESS}`);
  console.log(`Review: ${envVars.NEXT_PUBLIC_TESTNET_REVIEW_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

const fs = require('fs');
const path = require('path');

// Simple function to read .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('No .env file found, using default values');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      envVars[key.trim()] = value.trim();
    }
  });
  
  return envVars;
}

// Load .env variables
const envVars = loadEnvFile();


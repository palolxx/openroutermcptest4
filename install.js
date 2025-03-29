#!/usr/bin/env node
/**
 * Installation script for the OpenRouter MCP client
 * Sets up the environment and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for better display
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`
${colors.bright}${colors.blue}=======================================
      OPENROUTER MCP CLIENT SETUP
=======================================${colors.reset}

This script will help you set up the OpenRouter MCP client.
`);

// Check if .env exists
const envFile = path.join(__dirname, '.env');
const envExampleFile = path.join(__dirname, '.env.example');

function installDependencies() {
  console.log(`\n${colors.yellow}Installing dependencies...${colors.reset}`);
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Dependencies installed successfully.${colors.reset}`);
    
    buildProject();
  } catch (error) {
    console.error(`${colors.red}Error installing dependencies:${colors.reset}`, error.message);
    process.exit(1);
  }
}

function buildProject() {
  console.log(`\n${colors.yellow}Building the project...${colors.reset}`);
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Project built successfully.${colors.reset}`);
    
    showFinalInstructions();
  } catch (error) {
    console.error(`${colors.red}Error building project:${colors.reset}`, error.message);
    process.exit(1);
  }
}

function showFinalInstructions() {
  console.log(`
${colors.bright}${colors.green}✅ Installation complete!${colors.reset}

${colors.bright}What's next:${colors.reset}

1. Use the client with Cursor:
   - Open Cursor settings
   - Navigate to AI settings
   - Add a custom MCP client using the path to this client
   - Save and restart Cursor

2. Test the multi-model API directly:
   ${colors.yellow}node dist/index.js${colors.reset}
   (Uncomment the test functions in src/index.ts first)

${colors.bright}${colors.blue}=======================================
           SETUP COMPLETED
=======================================${colors.reset}
`);
  process.exit(0);
}

// Start by checking/creating .env file
if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
  console.log(`${colors.yellow}No .env file found. I'll help you create one.${colors.reset}`);
  
  rl.question(`\nEnter your OpenRouter API key (get it from https://openrouter.ai/keys): `, (apiKey) => {
    if (!apiKey) {
      console.log(`${colors.red}No API key provided. You'll need to manually edit the .env file later.${colors.reset}`);
      apiKey = 'your_api_key_here';
    }
    
    // Read the example file and replace the API key
    let envContent = fs.readFileSync(envExampleFile, 'utf8');
    envContent = envContent.replace('your_api_key_here', apiKey.trim());
    
    // Ask for default model
    rl.question(`\nEnter default model (press Enter for google/gemini-2.5-pro-exp-03-25:free): `, (defaultModel) => {
      if (defaultModel.trim()) {
        envContent = envContent.replace('google/gemini-2.5-pro-exp-03-25:free', defaultModel.trim());
      }
      
      // Write the new .env file
      fs.writeFileSync(envFile, envContent);
      console.log(`${colors.green}✓ .env file created.${colors.reset}`);
      
      rl.close();
      installDependencies();
    });
  });
} else if (fs.existsSync(envFile)) {
  console.log(`${colors.green}✓ .env file already exists.${colors.reset}`);
  installDependencies();
} else {
  console.log(`${colors.red}⚠ .env.example file not found. Creating a basic .env file...${colors.reset}`);
  
  const basicEnvContent = `# OpenRouter API Key - Get it from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_api_key_here

# Default model to use if none specified
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-pro-exp-03-25:free`;
  
  fs.writeFileSync(envFile, basicEnvContent);
  console.log(`${colors.green}✓ Basic .env file created. You'll need to edit it manually.${colors.reset}`);
  
  installDependencies();
} 
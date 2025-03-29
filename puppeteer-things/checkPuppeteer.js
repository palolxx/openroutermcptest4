/**
 * Utility to check and fix puppeteer on Windows
 * This script helps ensure puppeteer works correctly in the OpenRouter MCP client
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Puppeteer installation...');

try {
  // Try to require puppeteer to see if it's installed
  require('puppeteer');
  console.log('✅ Puppeteer is already installed');
} catch (error) {
  console.log('⚠️ Puppeteer is not installed. Installing now...');
  
  try {
    execSync('npm install puppeteer@latest --save', { stdio: 'inherit' });
    console.log('✅ Puppeteer installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Puppeteer:', installError.message);
    process.exit(1);
  }
}

// Check if running on Windows
const isWindows = process.platform === 'win32';
if (isWindows) {
  console.log('🪟 Windows detected - checking for common Puppeteer issues...');
  
  try {
    // Try to launch Chrome to see if it works
    const puppeteer = require('puppeteer');
    console.log('🚀 Testing browser launch...');
    
    (async () => {
      try {
        // Launch with specific arguments for Windows
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null, // Full page size
          args: [
            '--start-maximized', // Start maximized
            '--disable-infobars', // Disable info bars
            '--no-sandbox', // Required for some Windows environments
            '--disable-setuid-sandbox', // Required for some Windows environments
            '--disable-dev-shm-usage', // Overcome limited resource issues
          ]
        });
        
        console.log('✅ Successfully launched browser');
        
        // Create a simple test page to confirm it's working
        const page = await browser.newPage();
        await page.setContent('<html><body><h1>Puppeteer Test</h1><p>If you see this, Puppeteer is working correctly!</p></body></html>');
        console.log('✅ Test page created successfully');
        
        // Wait for 3 seconds so user can see the test page
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Close browser
        await browser.close();
        console.log('✅ Browser closed successfully');
        console.log('✅ Puppeteer is set up correctly!');
      } catch (launchError) {
        console.error('❌ Failed to launch browser:', launchError.message);
        console.log('⚠️ Trying to fix common issues...');
        
        // Create the fix script
        const fixScript = path.join(__dirname, 'fixPuppeteer.js');
        fs.writeFileSync(fixScript, `
          /**
           * Fix script for Puppeteer on Windows
           */
          const { execSync } = require('child_process');
          
          console.log('🔧 Running Puppeteer fixes for Windows...');
          
          try {
            // Install dependencies that might be missing
            console.log('📦 Installing missing dependencies...');
            execSync('npm install puppeteer-core --save', { stdio: 'inherit' });
            
            // Try to fix Chrome path issues
            console.log('🔍 Checking Chrome installation...');
            const { execSync } = require('child_process');
            const defaultChromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
            const defaultChromePath2 = 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
            
            let chromePath = '';
            
            try {
              // Check default Chrome locations
              if (require('fs').existsSync(defaultChromePath)) {
                chromePath = defaultChromePath;
              } else if (require('fs').existsSync(defaultChromePath2)) {
                chromePath = defaultChromePath2;
              } else {
                // Try to find Chrome with PowerShell
                console.log('🔍 Searching for Chrome installation...');
                const output = execSync('powershell -command "& {Get-ItemProperty \\'HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\App Paths\\\\chrome.exe\\' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty \\'(Default)\\' -ErrorAction SilentlyContinue}"').toString().trim();
                if (output) {
                  chromePath = output;
                }
              }
              
              if (chromePath) {
                console.log(\`✅ Found Chrome at: \${chromePath}\`);
                console.log('📝 Creating configuration file with correct Chrome path...');
                
                // Create a puppeteer config file
                const configPath = require('path').join(process.cwd(), 'puppeteer-config.json');
                require('fs').writeFileSync(configPath, JSON.stringify({
                  executablePath: chromePath,
                  defaultViewport: null,
                  args: [
                    '--start-maximized',
                    '--disable-infobars',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                  ]
                }, null, 2));
                
                console.log(\`✅ Configuration saved to \${configPath}\`);
              } else {
                console.error('❌ Could not find Chrome. Please install Google Chrome and try again.');
              }
            } catch (error) {
              console.error('❌ Error finding Chrome:', error.message);
            }
            
            console.log('✅ Fix completed! Please try running your script again.');
          } catch (error) {
            console.error('❌ Fix failed:', error.message);
          }
        `);
        
        console.log('🚀 Running fix script...');
        execSync(`node "${fixScript}"`, { stdio: 'inherit' });
      }
    })();
  } catch (error) {
    console.error('❌ Error testing Puppeteer:', error.message);
  }
} else {
  console.log('✅ Not on Windows - skipping Windows-specific checks');
}

// Export utility functions for use in other scripts
module.exports = {
  createBrowser: async function(options = {}) {
    const puppeteer = require('puppeteer');
    
    // Check if we have a config file
    const configPath = path.join(process.cwd(), 'puppeteer-config.json');
    let config = {
      headless: false,
      defaultViewport: null, // Full page size
      args: [
        '--start-maximized',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ]
    };
    
    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...userConfig };
      } catch (error) {
        console.error('❌ Error reading config file:', error.message);
      }
    }
    
    // Merge with user options
    config = { ...config, ...options };
    
    return puppeteer.launch(config);
  }
}; 
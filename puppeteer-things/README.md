# Puppeteer Utilities for OpenRouter MCP Client

This directory contains utility scripts for testing and visualizing OpenRouter API using Puppeteer.

## What's Included

1. **checkPuppeteer.js** - Verifies Puppeteer installation and fixes common issues on Windows
2. **browser-test.js** - Visualizes responses from multiple models in a browser window

## Usage

### Check Puppeteer Installation

Before using any Puppeteer-based visualizations, run the check utility:

```bash
npm run check:puppeteer
```

This will:
- Check if Puppeteer is installed and install it if needed
- Test if Chrome can be launched successfully
- On Windows, automatically detect and fix common issues
- Create a configuration file with the correct Chrome path if needed

### Run Browser Visualization Test

To see responses from multiple models displayed in a browser:

```bash
npm run test:browser
```

This will:
- Launch a Chrome browser in windowed mode
- Make API calls to several OpenRouter models
- Display the responses side-by-side in the browser

## Customizing Browser Tests

You can modify `browser-test.js` to:
- Change the models being tested
- Change the system and user prompts
- Customize the visualization's appearance

## Troubleshooting

If you experience issues running Puppeteer:

1. Make sure you have Chrome installed
2. Run the `check:puppeteer` script to diagnose and fix issues
3. Check the error messages for clues about what's going wrong
4. Make sure your OpenRouter API key is set in the `.env` file

## Notes for Windows Users

On Windows, Puppeteer sometimes has issues finding Chrome. The `checkPuppeteer.js` script will:

1. Check common Chrome installation locations
2. Use PowerShell to search for Chrome in the registry
3. Create a configuration file with the exact path to Chrome
4. Configure Chrome to run in windowed mode, not fullscreen

If you're still having issues, you can edit the `puppeteer-config.json` file that is created 
to manually specify the path to your Chrome installation. 
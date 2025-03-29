/**
 * Test script for visualizing OpenRouter API responses in a browser
 * Uses puppeteer to create a visual display of model responses
 */

const { createBrowser } = require('./checkPuppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Get API key from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Make sure we have an API key
if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable is required');
  process.exit(1);
}

// Create an axios instance for OpenRouter
const openRouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://github.com/cursor-ai',
    'X-Title': 'Cursor OpenRouter Visualization'
  }
});

// The main function that visualizes responses
async function visualizeResponses() {
  console.log('Starting browser for visualization...');
  
  // Launch the browser using our helper
  const browser = await createBrowser();
  const page = await browser.newPage();
  
  // Sample models to test (using free models only)
  const modelsToTest = [
    'google/gemini-2.5-pro-exp-03-25:free',
    'deepseek/deepseek-chat-v3-0324:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free'
  ];
  
  // The prompt to test with
  const messages = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'Explain how async/await works in JavaScript with a simple example.' }
  ];
  
  // Create HTML content with CSS styles
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OpenRouter Model Responses</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }
        .status {
          text-align: center;
          font-size: 18px;
          margin-bottom: 20px;
          color: #0066cc;
        }
        .model-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .model-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .model-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .model-name {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
          color: #333;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        .response {
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.6;
          max-height: 500px;
          overflow-y: auto;
          padding: 10px;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        .prompt {
          margin: 20px 0;
          padding: 15px;
          background-color: #e9f7fe;
          border-radius: 8px;
          border-left: 4px solid #0099ff;
        }
        .error {
          color: #cc0000;
          font-weight: bold;
        }
        .loading {
          color: #666;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>OpenRouter Model Responses</h1>
      <div class="prompt">
        <strong>System:</strong> ${messages[0].content}<br><br>
        <strong>User:</strong> ${messages[1].content}
      </div>
      <div class="status">Loading responses from models...</div>
      <div class="model-container" id="responses"></div>
    </body>
    </html>
  `);
  
  // Function to append a model response
  async function appendModelResponse(modelId, content, isError = false) {
    await page.evaluate((modelId, content, isError) => {
      const container = document.getElementById('responses');
      const card = document.createElement('div');
      card.className = 'model-card';
      
      const modelName = document.createElement('div');
      modelName.className = 'model-name';
      modelName.textContent = modelId;
      
      const response = document.createElement('div');
      response.className = isError ? 'response error' : 'response';
      response.textContent = content;
      
      card.appendChild(modelName);
      card.appendChild(response);
      container.appendChild(card);
    }, modelId, content, isError);
  }
  
  // Update status message
  async function updateStatus(message) {
    await page.evaluate((message) => {
      document.querySelector('.status').textContent = message;
    }, message);
  }
  
  // Create initial placeholders
  for (const model of modelsToTest) {
    await appendModelResponse(model, 'Loading response...', false);
  }
  
  // Fetch responses from each model
  let completed = 0;
  
  // Process models in parallel
  await Promise.all(modelsToTest.map(async (modelId, index) => {
    try {
      console.log(`Requesting completion from ${modelId}...`);
      
      const response = await openRouter.post('/chat/completions', {
        model: modelId,
        messages: messages
      });
      
      const content = response.data.choices[0]?.message?.content || 'No content returned';
      
      // Update the browser with the response
      await page.evaluate((index, content) => {
        const cards = document.querySelectorAll('.model-card');
        if (cards[index]) {
          const responseEl = cards[index].querySelector('.response');
          responseEl.textContent = content;
          responseEl.className = 'response'; // Remove loading class
        }
      }, index, content);
      
    } catch (error) {
      console.error(`Error with model ${modelId}:`, error.message);
      
      // Update the browser with the error
      await page.evaluate((index, errorMessage) => {
        const cards = document.querySelectorAll('.model-card');
        if (cards[index]) {
          const responseEl = cards[index].querySelector('.response');
          responseEl.textContent = `Error: ${errorMessage}`;
          responseEl.className = 'response error';
        }
      }, index, error.message);
    }
    
    // Update progress
    completed++;
    await updateStatus(`Completed ${completed} of ${modelsToTest.length} models`);
  }));
  
  // All done
  await updateStatus(`All ${modelsToTest.length} model responses complete`);
  console.log('Visualization complete! Browser will stay open so you can view the results.');
  
  // Let the browser stay open so the user can see the results
  // The script will need to be manually terminated
}

// Run the visualization
visualizeResponses().catch(error => {
  console.error('Error in visualization:', error);
}); 
#!/usr/bin/env node
import dotenv from 'dotenv';
import { OpenRouterClient } from './openrouter-client.js';
import { OpenRouterAPIClient } from './openrouter-api.js';
import { getMultiModelCompletion, combineCompletions } from './multi-model-completion.js';
// Load environment variables
dotenv.config();
// Get API key from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.5-pro-exp-03-25:free';
// Check for API key
if (!OPENROUTER_API_KEY) {
    console.error('Error: OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
}
async function main() {
    try {
        console.error('OpenRouter MCP client starting...');
        // Create client
        const client = new OpenRouterClient({
            apiKey: OPENROUTER_API_KEY,
            defaultModel: DEFAULT_MODEL,
            appName: 'Cursor OpenRouter MCP Client'
        });
        console.error('OpenRouter MCP client running on stdio...');
        // Keep process alive
        setInterval(() => {
            // No-op to keep the process running
        }, 60000);
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.error('Shutting down...');
            await client.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Error initializing OpenRouter MCP client:', error);
        process.exit(1);
    }
}
// Direct OpenRouter API usage example (for testing without MCP)
async function testDirectApi() {
    try {
        if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key is required');
        }
        const apiClient = new OpenRouterAPIClient(OPENROUTER_API_KEY, 'Cursor OpenRouter Test');
        // Test models endpoint
        const models = await apiClient.fetchModels();
        console.log(`Available models: ${models.data.length}`);
        // Test chat completion
        const response = await apiClient.chatCompletion({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, who are you?' }
            ]
        });
        console.log('Chat completion response:', response.data);
    }
    catch (error) {
        console.error('API test error:', error);
    }
}
// Test completion with multiple models
async function testMultiModelCompletion() {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key is required');
    }
    try {
        // Example using free models
        const freeModels = [
            'deepseek/deepseek-chat-v3-0324:free',
            'google/gemini-2.5-pro-exp-03-25:free',
            'meta-llama/llama-3.1-8b-instruct:free',
            'qwen/qwen-2.5-coder-32b-instruct:free'
        ];
        console.log(`Testing multi-model completion with ${freeModels.length} models...`);
        const results = await getMultiModelCompletion({
            apiKey: OPENROUTER_API_KEY,
            models: freeModels,
            messages: [
                { role: 'system', content: 'You are a helpful coding assistant. Provide concise, well-commented code.' },
                { role: 'user', content: 'Write a function in JavaScript that calculates the Fibonacci sequence up to n elements.' }
            ],
            appName: 'Cursor OpenRouter Multi-Model Test'
        });
        const combined = combineCompletions(results);
        console.log("===== COMBINED RESULTS FROM ALL MODELS =====");
        console.log(combined);
        // Calculate success rate
        const successCount = results.filter(r => !r.error).length;
        console.log(`Success rate: ${successCount}/${freeModels.length} models (${Math.round(successCount / freeModels.length * 100)}%)`);
        // Show errors if any
        const failures = results.filter(r => r.error);
        if (failures.length > 0) {
            console.log("\n===== FAILURES =====");
            for (const failure of failures) {
                console.log(`${failure.modelId}: ${failure.error}`);
            }
        }
    }
    catch (error) {
        console.error('Multi-model test error:', error);
    }
}
// Uncomment one of these to test the direct API
// testDirectApi().catch(console.error);
// testMultiModelCompletion().catch(console.error);
// Run the main client
main().catch(console.error);
//# sourceMappingURL=index.js.map
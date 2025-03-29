/**
 * Utility to get completions from multiple OpenRouter models and combine the results
 */
import { OpenRouterAPIClient } from './openrouter-api.js';
export async function getMultiModelCompletion(options) {
    const apiClient = new OpenRouterAPIClient(options.apiKey, options.appName || 'Cursor OpenRouter Multi-Model Client');
    const results = [];
    const completionPromises = options.models.map(async (modelId) => {
        try {
            console.log(`Getting completion from ${modelId}...`);
            const response = await apiClient.chatCompletion({
                model: modelId,
                messages: options.messages,
                temperature: options.temperature || 0.7
            });
            // Extract the content from the completion
            const content = response.data.choices[0]?.message?.content || '';
            return {
                modelId,
                content
            };
        }
        catch (error) {
            console.error(`Error getting completion from ${modelId}:`, error);
            return {
                modelId,
                content: '',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
    // Wait for all completions to finish
    const completions = await Promise.all(completionPromises);
    results.push(...completions);
    return results;
}
export function combineCompletions(results) {
    let combined = '';
    const validResults = results.filter(r => r.content && !r.error);
    if (validResults.length === 0) {
        return 'No valid completions received from any model.';
    }
    for (const result of validResults) {
        combined += `=== Model: ${result.modelId} ===\n\n${result.content}\n\n`;
    }
    return combined;
}
// Example usage in code:
// 
// const options = {
//   apiKey: process.env.OPENROUTER_API_KEY || '',
//   models: [
//     'google/gemini-2.5-pro-exp-03-25:free',
//     'deepseek/deepseek-chat-v3-0324:free',
//     'meta-llama/llama-3.1-8b-instruct:free',
//     'qwen/qwen-2.5-coder-32b-instruct:free'
//   ],
//   messages: [
//     { role: 'system', content: 'You are a helpful coding assistant.' },
//     { role: 'user', content: 'Write a simple Hello World program in Python.' }
//   ]
// };
// 
// const results = await getMultiModelCompletion(options);
// const combined = combineCompletions(results);
// console.log(combined); 
//# sourceMappingURL=multi-model-completion.js.map
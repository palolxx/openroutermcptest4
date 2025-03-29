import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { OpenRouterAPIClient } from './openrouter-api.js';
import { ModelCache } from './model-cache.js';
// Load environment variables
dotenv.config();
export class OpenRouterClient {
    client;
    apiClient;
    modelCache;
    defaultModel;
    constructor(options) {
        if (!options.apiKey) {
            throw new Error('OpenRouter API key is required');
        }
        this.apiClient = new OpenRouterAPIClient(options.apiKey, options.appName);
        this.modelCache = ModelCache.getInstance();
        this.defaultModel = options.defaultModel || 'google/gemini-2.5-pro-exp-03-25:free';
        // Client configuration
        const config = {
            name: 'openrouter-client',
            version: '1.0.0',
        };
        this.client = new Client(config);
        // Set up event handlers
        this.client.onerror = (error) => {
            console.error('[MCP Client Error]', error);
        };
        // Use process.stdin/stdout directly
        // Let it get connected automatically when running with Cursor
        this.initializeCache().catch(error => {
            console.error('Failed to initialize model cache:', error);
        });
    }
    async initializeCache() {
        try {
            const models = await this.apiClient.fetchModels();
            this.modelCache.setCachedModels(models);
            console.log(`Cached ${models.data.length} models from OpenRouter`);
        }
        catch (error) {
            console.error('Failed to initialize model cache:', error);
        }
    }
    async getModels() {
        let cachedModels = this.modelCache.getCachedModels();
        if (!cachedModels) {
            const models = await this.apiClient.fetchModels();
            this.modelCache.setCachedModels(models);
            cachedModels = this.modelCache.getCachedModels();
        }
        return cachedModels?.data.map(model => model.id) || [];
    }
    async chatCompletion(params) {
        const modelId = params.model || this.defaultModel;
        // Validate model ID
        const isValidModel = await this.modelCache.validateModel(modelId);
        if (!isValidModel) {
            // If model cache is empty or model not found, refresh cache
            const models = await this.apiClient.fetchModels();
            this.modelCache.setCachedModels(models);
            const isModelValid = await this.modelCache.validateModel(modelId);
            if (!isModelValid) {
                throw new Error(`Invalid model ID: ${modelId}`);
            }
        }
        // Call the chat_completion tool
        const response = await this.client.callTool({
            name: 'chat_completion',
            arguments: {
                model: modelId,
                messages: params.messages,
                temperature: params.temperature
            }
        });
        if (response.schema === CallToolResultSchema) {
            return response.result;
        }
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    async searchModels(params) {
        // Call the search_models tool
        const response = await this.client.callTool({
            name: 'search_models',
            arguments: {
                query: params.query,
                provider: params.provider,
                limit: params.limit || 10
            }
        });
        if (response.schema === CallToolResultSchema) {
            return response.result;
        }
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    async getModelInfo(modelId) {
        // Call the get_model_info tool
        const response = await this.client.callTool({
            name: 'get_model_info',
            arguments: {
                model: modelId
            }
        });
        if (response.schema === CallToolResultSchema) {
            return response.result;
        }
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    async validateModel(modelId) {
        // Call the validate_model tool
        const response = await this.client.callTool({
            name: 'validate_model',
            arguments: {
                model: modelId
            }
        });
        if (response.schema === CallToolResultSchema) {
            return response.result.valid;
        }
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    // Utility method to close the client connection
    async close() {
        await this.client.close();
    }
}
//# sourceMappingURL=openrouter-client.js.map
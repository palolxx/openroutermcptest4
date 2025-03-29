export interface OpenRouterClientOptions {
    apiKey: string;
    defaultModel?: string;
    appName?: string;
    transport?: any;
}
export declare class OpenRouterClient {
    private client;
    private apiClient;
    private modelCache;
    private defaultModel;
    constructor(options: OpenRouterClientOptions);
    private initializeCache;
    getModels(): Promise<string[]>;
    chatCompletion(params: {
        model?: string;
        messages: Array<{
            role: string;
            content: string;
        }>;
        temperature?: number;
    }): Promise<any>;
    searchModels(params: {
        query?: string;
        provider?: string;
        limit?: number;
    }): Promise<any>;
    getModelInfo(modelId: string): Promise<any>;
    validateModel(modelId: string): Promise<boolean>;
    close(): Promise<void>;
}

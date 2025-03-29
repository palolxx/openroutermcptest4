export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length: number;
    pricing: {
        prompt: string;
        completion: string;
        unit: number;
    };
    top_provider?: {
        max_completion_tokens?: number;
        max_context_length?: number;
    };
    capabilities?: {
        functions?: boolean;
        tools?: boolean;
        vision?: boolean;
        json_mode?: boolean;
    };
}
export interface OpenRouterModelResponse {
    data: OpenRouterModel[];
}
export interface RateLimitState {
    remaining: number;
    reset: number;
    total: number;
}
export declare const RETRY_DELAYS: number[];
export declare class OpenRouterAPIClient {
    private axiosInstance;
    private rateLimit;
    constructor(apiKey: string, appName?: string);
    fetchModels(): Promise<OpenRouterModelResponse>;
    chatCompletion(params: {
        model: string;
        messages: Array<{
            role: string;
            content: string;
        }>;
        temperature?: number;
        stream?: boolean;
    }): Promise<import("axios").AxiosResponse<any, any>>;
    getRateLimit(): RateLimitState;
}

import { OpenRouterModel, OpenRouterModelResponse } from './openrouter-api.js';
export interface CachedModelResponse extends OpenRouterModelResponse {
    timestamp: number;
}
export declare class ModelCache {
    private static instance;
    private cachedModels;
    private readonly cacheExpiry;
    private constructor();
    static getInstance(): ModelCache;
    private validateCache;
    setCachedModels(models: OpenRouterModelResponse): void;
    getCachedModels(): CachedModelResponse | null;
    clearCache(): void;
    validateModel(model: string): Promise<boolean>;
    getModelInfo(model: string): Promise<OpenRouterModel | undefined>;
    getModelsByProvider(provider: string): Promise<OpenRouterModel[]>;
    getFreeModels(): Promise<OpenRouterModel[]>;
}

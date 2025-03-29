import { OpenRouterModel, OpenRouterModelResponse } from './openrouter-api.js';

export interface CachedModelResponse extends OpenRouterModelResponse {
  timestamp: number;
}

// Simple in-memory state management
export class ModelCache {
  private static instance: ModelCache;
  private cachedModels: CachedModelResponse | null = null;
  private readonly cacheExpiry = 3600000; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): ModelCache {
    if (!ModelCache.instance) {
      ModelCache.instance = new ModelCache();
    }
    return ModelCache.instance;
  }

  private validateCache(): boolean {
    if (!this.cachedModels) return false;
    return Date.now() - this.cachedModels.timestamp <= this.cacheExpiry;
  }

  setCachedModels(models: OpenRouterModelResponse) {
    this.cachedModels = {
      ...models,
      timestamp: Date.now()
    };
  }

  getCachedModels(): CachedModelResponse | null {
    return this.validateCache() ? this.cachedModels : null;
  }

  clearCache() {
    this.cachedModels = null;
  }

  async validateModel(model: string): Promise<boolean> {
    const models = this.getCachedModels();
    if (!models) return false;
    return models.data.some(m => m.id === model);
  }

  async getModelInfo(model: string): Promise<OpenRouterModel | undefined> {
    const models = this.getCachedModels();
    if (!models) return undefined;
    return models.data.find(m => m.id === model);
  }
  
  // Find models by provider (e.g., 'google', 'anthropic', etc.)
  async getModelsByProvider(provider: string): Promise<OpenRouterModel[]> {
    const models = this.getCachedModels();
    if (!models) return [];
    return models.data.filter(m => m.id.toLowerCase().includes(provider.toLowerCase()));
  }
  
  // Get all free models
  async getFreeModels(): Promise<OpenRouterModel[]> {
    const models = this.getCachedModels();
    if (!models) return [];
    return models.data.filter(m => m.id.includes(':free'));
  }
} 
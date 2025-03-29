// Simple in-memory state management
export class ModelCache {
    static instance;
    cachedModels = null;
    cacheExpiry = 3600000; // 1 hour in milliseconds
    constructor() { }
    static getInstance() {
        if (!ModelCache.instance) {
            ModelCache.instance = new ModelCache();
        }
        return ModelCache.instance;
    }
    validateCache() {
        if (!this.cachedModels)
            return false;
        return Date.now() - this.cachedModels.timestamp <= this.cacheExpiry;
    }
    setCachedModels(models) {
        this.cachedModels = {
            ...models,
            timestamp: Date.now()
        };
    }
    getCachedModels() {
        return this.validateCache() ? this.cachedModels : null;
    }
    clearCache() {
        this.cachedModels = null;
    }
    async validateModel(model) {
        const models = this.getCachedModels();
        if (!models)
            return false;
        return models.data.some(m => m.id === model);
    }
    async getModelInfo(model) {
        const models = this.getCachedModels();
        if (!models)
            return undefined;
        return models.data.find(m => m.id === model);
    }
    // Find models by provider (e.g., 'google', 'anthropic', etc.)
    async getModelsByProvider(provider) {
        const models = this.getCachedModels();
        if (!models)
            return [];
        return models.data.filter(m => m.id.toLowerCase().includes(provider.toLowerCase()));
    }
    // Get all free models
    async getFreeModels() {
        const models = this.getCachedModels();
        if (!models)
            return [];
        return models.data.filter(m => m.id.includes(':free'));
    }
}
//# sourceMappingURL=model-cache.js.map
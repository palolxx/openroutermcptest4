/**
 * Utility to get completions from multiple OpenRouter models and combine the results
 */
export interface CompletionMessage {
    role: string;
    content: string;
}
export interface MultiModelCompletionResult {
    modelId: string;
    content: string;
    error?: string;
}
export interface MultiModelCompletionOptions {
    apiKey: string;
    models: string[];
    messages: CompletionMessage[];
    temperature?: number;
    appName?: string;
}
export declare function getMultiModelCompletion(options: MultiModelCompletionOptions): Promise<MultiModelCompletionResult[]>;
export declare function combineCompletions(results: MultiModelCompletionResult[]): string;

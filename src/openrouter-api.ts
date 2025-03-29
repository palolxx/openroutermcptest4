import axios, { AxiosError, AxiosInstance } from 'axios';
import { setTimeout } from 'timers/promises';

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

export const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff delays in ms

export class OpenRouterAPIClient {
  private axiosInstance: AxiosInstance;
  private rateLimit: RateLimitState = {
    remaining: 50, // Default conservative value
    reset: Date.now() + 60000,
    total: 50
  };

  constructor(apiKey: string, appName: string = 'Cursor OpenRouter MCP Client') {
    // Initialize axios instance for OpenRouter API
    this.axiosInstance = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/cursor-ai',
        'X-Title': appName
      }
    });

    // Add response interceptor for rate limit headers
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '50');
        const reset = parseInt(response.headers['x-ratelimit-reset'] || '60');
        const total = parseInt(response.headers['x-ratelimit-limit'] || '50');

        this.rateLimit = {
          remaining,
          reset: Date.now() + (reset * 1000),
          total
        };

        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded, waiting for reset...');
          const resetAfter = parseInt(error.response.headers['retry-after'] as string || '60');
          await setTimeout(resetAfter * 1000);
          return this.axiosInstance.request(error.config as any);
        }
        throw error;
      }
    );
  }

  async fetchModels(): Promise<OpenRouterModelResponse> {
    // Check rate limits before making request
    if (this.rateLimit.remaining <= 0 && Date.now() < this.rateLimit.reset) {
      const waitTime = this.rateLimit.reset - Date.now();
      await setTimeout(waitTime);
    }

    // Retry mechanism for fetching models
    for (let i = 0; i <= RETRY_DELAYS.length; i++) {
      try {
        const response = await this.axiosInstance.get<OpenRouterModelResponse>('/models');
        return response.data;
      } catch (error) {
        if (i === RETRY_DELAYS.length) throw error;
        await setTimeout(RETRY_DELAYS[i]);
      }
    }

    throw new Error('Failed to fetch models after multiple attempts');
  }

  async chatCompletion(params: {
    model: string, 
    messages: Array<{role: string, content: string}>, 
    temperature?: number,
    stream?: boolean
  }) {
    return this.axiosInstance.post('/chat/completions', {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      stream: params.stream ?? false
    });
  }

  getRateLimit(): RateLimitState {
    return { ...this.rateLimit };
  }
} 
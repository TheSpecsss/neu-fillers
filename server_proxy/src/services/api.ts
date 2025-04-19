import { config } from '../config.js';

interface ChatCompletionRequest {
  model?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

interface EmbeddingRequest {
  model?: string;
  input: string;
  [key: string]: unknown;
}

class ApiService {
  private getProviderHeaders() {
    const headers = { ...config.api.headers };
    
    if (config.api.provider === 'openrouter') {
      headers['HTTP-Referer'] = config.cors.origins[0];
      headers['X-Title'] = 'Element Mover App';
    }
    
    return headers;
  }

  async makeRequest<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getProviderHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `${config.api.provider} API Error`);
    }

    return response.json();
  }

  async createChatCompletion(
    { model, messages, temperature = 0.7, max_tokens = 1000, ...options }: ChatCompletionRequest
  ) {
    const defaultModel = config.api.provider === 'openrouter' 
      ? 'openai/gpt-3.5-turbo'
      : 'gpt-3.5-turbo';

    return this.makeRequest('/chat/completions', {
      model: model || defaultModel,
      messages,
      temperature,
      max_tokens,
      ...options,
    });
  }

  async createEmbedding(
    { model, input, ...options }: EmbeddingRequest
  ) {
    const defaultModel = config.api.provider === 'openrouter'
      ? 'openai/text-embedding-ada-002'
      : 'text-embedding-ada-002';

    return this.makeRequest('/embeddings', {
      model: model || defaultModel,
      input,
      ...options,
    });
  }
}

export const apiService = new ApiService(); 
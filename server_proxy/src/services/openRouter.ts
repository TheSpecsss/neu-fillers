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

class OpenRouterService {
  async makeRequest<T>(endpoint: string, apiKey: string, body: unknown): Promise<T> {
    const response = await fetch(`${config.openRouter.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...config.openRouter.headers
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenRouter API Error');
    }

    return response.json();
  }

  async createChatCompletion(
    apiKey: string,
    { model, messages, temperature = 0.7, max_tokens = 1000, ...options }: ChatCompletionRequest
  ) {
    return this.makeRequest('/chat/completions', apiKey, {
      model: model || config.openRouter.models.default,
      messages,
      temperature,
      max_tokens,
      ...options
    });
  }

  async createEmbedding(
    apiKey: string,
    { model, input, ...options }: EmbeddingRequest
  ) {
    return this.makeRequest('/embeddings', apiKey, {
      model: model || config.openRouter.models.embedding,
      input,
      ...options
    });
  }
}

export const openRouterService = new OpenRouterService(); 
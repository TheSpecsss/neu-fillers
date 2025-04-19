import { z } from 'zod';

// Response schemas
const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({
    message: z.object({
      role: z.enum(['assistant', 'user', 'system']),
      content: z.string(),
    }),
    finish_reason: z.string(),
    index: z.number(),
  })),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const EmbeddingResponseSchema = z.object({
  data: z.array(z.object({
    embedding: z.array(z.number()),
    index: z.number(),
    object: z.string(),
  })),
  model: z.string(),
  object: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

// Types
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

export interface EmbeddingOptions {
  model?: string;
  [key: string]: unknown;
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public type?: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = '/api/openrouter';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('VITE_OPENAI_API_KEY is not set in environment variables');
    }
  }

  private async request<T>(
    endpoint: string,
    body: unknown,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Element Mover App',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        throw new ApiError(
          errorData.error?.message || `HTTP error! status: ${response.status}`,
          errorData.error?.type,
          errorData.error?.code,
        );
      }

      const data = await response.json();
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ApiError('Invalid API response format');
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    return this.request(
      '/chat/completions',
      {
        messages,
        model: options.model || import.meta.env.VITE_OPENAI_MODEL,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      },
      ChatCompletionResponseSchema
    );
  }

  async createEmbedding(
    input: string,
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResponse> {
    return this.request(
      '/embeddings',
      { input, ...options },
      EmbeddingResponseSchema
    );
  }
} 
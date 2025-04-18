import OpenAI from "openai";
import { openAIConfig, validateEnvVariables } from "./config";

/*

To make this more secure, you could:
Create a backend proxy that handles the OpenAI API calls
Implement rate limiting
Use environment-specific API keys
Add request validation
Would you like me to:
Create a more secure backend proxy solution?
Add rate limiting to the current implementation?
Add any other security measures?
For now, the OpenAI test should work in the browser. Try testing it again and let me know if you encounter any other issues.

*/

// Types for the OpenAI client configuration
export interface OpenAIConfig {
	apiKey: string;
	organization?: string;
	maxRetries?: number;
	baseURL?: string;
}

// Types for common response formats
export interface ChatCompletionResponse {
	content: string;
	role: "assistant" | "user" | "system";
}

export interface ErrorResponse {
	error: {
		message: string;
		type: string;
		code: string | null;
	};
}

// Custom error class for OpenAI-related errors
export class OpenAIError extends Error {
	constructor(
		message: string,
		public code?: string,
	) {
		super(message);
		this.name = "OpenAIError";
	}
}

// OpenAI client class
export class OpenAIClient {
	private baseURL: string;
	private maxRetries: number;
	private headers: Record<string, string>;

	constructor(config?: Partial<OpenAIConfig>) {
		// Validate environment variables
		validateEnvVariables();

		// Merge provided config with environment variables
		const finalConfig = {
			apiKey: config?.apiKey || openAIConfig.apiKey,
			organization: config?.organization || openAIConfig.organization,
			maxRetries: config?.maxRetries || openAIConfig.maxRetries,
			baseURL: config?.baseURL || openAIConfig.baseURL,
		};

		this.baseURL = finalConfig.baseURL;
		this.maxRetries = finalConfig.maxRetries || 3;

		// Set up headers
		this.headers = {
			"Content-Type": "application/json",
		};
		if (finalConfig.organization) {
			this.headers["OpenAI-Organization"] = finalConfig.organization;
		}
	}

	/**
	 * Creates a chat completion with the OpenAI API
	 * @param messages Array of messages to send to the API
	 * @param model Model to use for completion (defaults to OPENAI_CHAT_MODEL or gpt-3.5-turbo)
	 * @returns Promise with the completion response
	 */
	async createChatCompletion(
		messages: { role: "user" | "assistant" | "system"; content: string }[],
		model = openAIConfig.models.chat,
	): Promise<ChatCompletionResponse> {
		try {
			console.log("Making request to:", `${this.baseURL}/chat/completions`);
			console.log("With headers:", this.headers);
			const response = await fetch(`${this.baseURL}/chat/completions`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify({
					model,
					messages,
					temperature: 0.7,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error("API Error Response:", error);
				throw new OpenAIError(
					error.error?.message || "An error occurred while calling OpenAI API",
					error.error?.code,
				);
			}

			const data = await response.json();

			// Handle both OpenAI and OpenRouter response formats
			const completion = data.choices?.[0]?.message || data.choices?.[0]?.delta;

			if (!completion) {
				console.error("Unexpected response format:", data);
				throw new OpenAIError("No completion received from API");
			}

			return {
				content: completion.content || "",
				role: completion.role as "assistant" | "user" | "system",
			};
		} catch (error) {
			if (error instanceof OpenAIError) {
				throw error;
			}

			throw new OpenAIError(
				error instanceof Error
					? error.message
					: "An error occurred while calling API",
			);
		}
	}

	/**
	 * Creates an embedding for the given text
	 * @param text Text to create embedding for
	 * @param model Model to use for embedding (defaults to OPENAI_EMBEDDING_MODEL or text-embedding-ada-002)
	 * @returns Promise with the embedding vector
	 */
	async createEmbedding(
		text: string,
		model = openAIConfig.models.embedding,
	): Promise<number[]> {
		try {
			const response = await fetch(`${this.baseURL}/embeddings`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify({
					model,
					input: text,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new OpenAIError(
					error.error?.message || "An error occurred while creating embedding",
					error.error?.code,
				);
			}

			const data = await response.json();

			// Handle both OpenAI and OpenRouter response formats
			const embedding = data.data?.[0]?.embedding || data.embeddings?.[0];

			if (!embedding) {
				console.error("Unexpected response format:", data);
				throw new OpenAIError("No embedding received from API");
			}

			return embedding;
		} catch (error) {
			if (error instanceof OpenAIError) {
				throw error;
			}

			throw new OpenAIError(
				error instanceof Error
					? error.message
					: "An error occurred while creating embedding",
			);
		}
	}
}

// Example usage:
/*
// The client will automatically use environment variables
const openaiClient = new OpenAIClient();

// Or you can override specific config values
const openaiClient = new OpenAIClient({
  organization: 'custom-org-id',
  maxRetries: 5,
  baseURL: 'https://your-custom-endpoint.com/v1',
});

// Chat completion
const response = await openaiClient.createChatCompletion([
  { role: 'user', content: 'Hello, how are you?' }
]);

// Create embedding
const embedding = await openaiClient.createEmbedding('Hello, world!');
*/

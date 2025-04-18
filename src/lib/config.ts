// OpenAI Configuration
export const openAIConfig = {
	// API key is optional - only used if not using proxy server
	apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
	organization: import.meta.env.VITE_OPENAI_ORGANIZATION,
	maxRetries: Number.parseInt(
		import.meta.env.VITE_OPENAI_MAX_RETRIES || "3",
		10,
	),
	baseURL:
		import.meta.env.VITE_OPENAI_BASE_URL || "http://localhost:3001/api/openai",
	models: {
		chat: import.meta.env.VITE_OPENAI_CHAT_MODEL || "gpt-3.5-turbo",
		embedding:
			import.meta.env.VITE_OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002",
	},
};

// Validate required environment variables
export function validateEnvVariables() {
	if (!import.meta.env.VITE_OPENAI_BASE_URL) {
		throw new Error(
			"VITE_OPENAI_BASE_URL is required. Please set it to your proxy server URL.",
		);
	}
	return true;
}

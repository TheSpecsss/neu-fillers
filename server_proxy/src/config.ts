import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

interface ServerConfig {
  port: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

interface CorsConfig {
  origins: string[];
  credentials: boolean;
}

interface OpenRouterConfig {
  baseUrl: string;
  apiKey: string | undefined;
  headers: {
    'HTTP-Referer': string;
    'X-Title': string;
  };
  models: {
    default: string;
    embedding: string;
  };
}

interface Config {
  server: ServerConfig;
  cors: CorsConfig;
  openRouter: OpenRouterConfig;
}

export const config: Config = {
  server: {
    port: Number(process.env.PORT) || 3001,
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      max: Number(process.env.RATE_LIMIT) || 60
    }
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [FRONTEND_URL],
    credentials: true
  },
  openRouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
    headers: {
      'HTTP-Referer': FRONTEND_URL,
      'X-Title': process.env.X_TITLE || 'Element Mover App'
    },
    models: {
      default: process.env.DEFAULT_MODEL || 'openai/gpt-3.5-turbo',
      embedding: process.env.EMBEDDING_MODEL || 'openai/text-embedding-ada-002'
    }
  }
}; 
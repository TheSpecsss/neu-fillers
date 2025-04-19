import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  PROXY_API_URL: z.string().url(),
  PROXY_API_KEY: z.string().min(1),
  PROXY_PORT: z.string().transform(Number),
  PROXY_PROVIDER: z.enum(['openai', 'openrouter']),
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('60').transform(Number),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Configuration types
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

interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  provider: 'openai' | 'openrouter';
  headers: Record<string, string>;
}

interface Config {
  server: ServerConfig;
  cors: CorsConfig;
  api: ApiConfig;
}

// Default allowed origins
const defaultOrigins = ['http://localhost:3000', 'http://localhost:8080'];

// Main configuration
export const config: Config = {
  server: {
    port: env.PROXY_PORT,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    },
  },
  cors: {
    origins: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : defaultOrigins,
    credentials: true,
  },
  api: {
    baseUrl: env.PROXY_API_URL,
    apiKey: env.PROXY_API_KEY,
    provider: env.PROXY_PROVIDER,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PROXY_API_KEY}`,
    },
  },
}; 
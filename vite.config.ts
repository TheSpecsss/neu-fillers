import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "node:url";
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number.parseInt(env.VITE_PORT || '5173', 10),
      strictPort: true,
      host: true, // Listen on all network interfaces
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api/openai': {
          target: env.VITE_OPENAI_API_BASE,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        },
        '/api/openrouter': {
          target: 'https://openrouter.ai/api/v1',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/openrouter/, '/api/v1'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Forward the API key from the original request
              const apiKey = req.headers['authorization']?.replace('Bearer ', '');
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
              }
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode);
            });
          },
        },
      },
    },
    define: {
      'process.env': {
        VITE_BACKEND_API_URL: JSON.stringify(env.VITE_BACKEND_API_URL),
        VITE_OPENAI_API_KEY: JSON.stringify(env.VITE_OPENAI_API_KEY),
        VITE_OPENAI_API_BASE: JSON.stringify(env.VITE_OPENAI_API_BASE),
        VITE_OPENAI_MODEL: JSON.stringify(env.VITE_OPENAI_MODEL),
        VITE_PORT: JSON.stringify(env.VITE_PORT),
        VITE_APP_TITLE: JSON.stringify(env.VITE_APP_TITLE),
      },
    },
  };
});

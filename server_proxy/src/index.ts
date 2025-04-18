import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { errorHandler } from './middleware.js';
import apiRoutes from './routes/api.js';

const app = express();

// Configure rate limiting
const limiter = rateLimit(config.server.rateLimit);

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/openai', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.server.port, () => {
  console.log(`Proxy server running on port ${config.server.port}`);
  console.log(`Allowed origins: ${config.cors.origins.join(', ')}`);
  console.log(`Default model: ${config.openRouter.models.default}`);
  console.log(`Embedding model: ${config.openRouter.models.embedding}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Proxy server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down proxy server...');
  server.close(() => {
    console.log('Proxy server shut down complete');
    process.exit(0);
  });
}); 
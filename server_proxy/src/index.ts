import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware.js';

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - more permissive in development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight requests for 10 minutes
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Rate limiting
app.use(rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.max,
}));

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.server.port, () => {
  console.log(`Proxy server running on port ${config.server.port}`);
  console.log(`Provider: ${config.api.provider}`);
  console.log(`API URL: ${config.api.baseUrl}`);
  console.log('CORS: Enabled for all origins');
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
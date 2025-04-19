import type { Request, Response, NextFunction } from 'express';
import { config } from './config.js';

// Extend Express Request type to include our custom properties
declare module 'express' {
  interface Request {
    apiKey?: string;
  }
}

// Authentication middleware
export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: {
        message: 'Authorization header is required',
        type: 'authentication_error',
      },
    });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      error: {
        message: 'Invalid authorization header format',
        type: 'authentication_error',
      },
    });
  }

  // Store the API key in the request object for later use
  req.apiKey = token;
  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('API Error:', err);

  res.status(500).json({
    error: {
      message: err.message || 'Internal server error',
      type: 'api_error',
    },
  });
}; 
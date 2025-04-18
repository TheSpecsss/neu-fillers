import type { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      apiKey?: string;
    }
  }
}

// Authentication middleware
export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log('Received request headers:', req.headers);
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    console.log('No x-api-key header found in request');
    res.status(401).json({
      error: 'Missing x-api-key header. Please provide your API key in the x-api-key header.'
    });
    return;
  }
  console.log('API key found in request');
  // Store the API key for use in the route handlers
  req.apiKey = typeof apiKey === 'string' ? apiKey : apiKey[0];
  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
}; 
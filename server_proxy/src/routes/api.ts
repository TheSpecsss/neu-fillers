import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticateRequest } from '../middleware.js';
import { apiService } from '../services/api.js';

const router = Router();

// Health check endpoint (no authentication required)
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    provider: process.env.PROXY_PROVIDER,
    timestamp: new Date().toISOString(),
  });
});

// Chat completions endpoint
router.post('/chat/completions', authenticateRequest, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await apiService.createChatCompletion(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Embeddings endpoint
router.post('/embeddings', authenticateRequest, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await apiService.createEmbedding(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router; 
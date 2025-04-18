import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticateRequest } from '../middleware.js';
import { openRouterService } from '../services/openRouter.js';
import { config } from '../config.js';

const router = Router();

// Chat completions endpoint
router.post('/chat/completions', authenticateRequest, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.apiKey) {
      throw new Error('API key is required');
    }
    const response = await openRouterService.createChatCompletion(req.apiKey, req.body);
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
    if (!req.apiKey) {
      throw new Error('API key is required');
    }
    const response = await openRouterService.createEmbedding(req.apiKey, req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    defaultModel: config.openRouter.models.default,
    embeddingModel: config.openRouter.models.embedding
  });
});

export default router; 
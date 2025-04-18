import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  user_id: number;
  email: string;
  role_access: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user?.role_access !== 99) {
        throw new Error('Admin access required');
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Admin access required' });
  }
}; 
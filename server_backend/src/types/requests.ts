import type { User } from '../models/user';
import type { Request, Response } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthResponse extends Response {
  redirect: {
    (url: string): void;
    (status: number, url: string): void;
  };
}

export interface JwtPayload {
  user_id: number;
  email: string;
  role_access: number;
  iat?: number;
  exp?: number;
}

export interface GoogleProfile {
  id: string;
  emails?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
} 
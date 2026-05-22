import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getJwtSecret } from '../config/jwtSecret';
import { logger } from '../lib/logger';
import { findUserById } from '../db/repositories';
import { resolveUserFromRequest } from './resolveUser';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: 'user' | 'admin';
  };
}

function getBearerToken(req: Request): string | undefined {
  const raw = req.headers.authorization;
  if (!raw || typeof raw !== 'string') return undefined;
  if (raw.startsWith('Bearer ')) return raw.slice(7);
  return raw;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fromPrincipal = await resolveUserFromRequest(req);
    if (fromPrincipal) {
      req.user = fromPrincipal;
      return next();
    }

    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as {
      userId: string;
      email: string;
      role?: 'user' | 'admin';
    };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'JWT_SECRET is not configured') {
      logger.error('authMiddleware', error, { path: req.path });
      return res.status(500).json({ error: 'Server auth is not configured' });
    }
    logger.error('authMiddleware', error, {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await findUserById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    const errorDetails = logger.error('adminMiddleware', error, {
      method: req.method,
      path: req.path,
      userId: req.user?.userId,
    });
    res.status(errorDetails.statusCode || 500).json({ error: 'Server error during authorization' });
  }
};

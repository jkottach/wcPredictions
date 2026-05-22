import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

/** Communities removed in light app — keep routes for API compatibility. */
export const getAllCommunities = async (_req: AuthRequest, res: Response) => {
  res.json([]);
};

export const getCommunityById = async (_req: AuthRequest, res: Response) => {
  res.status(404).json({ error: 'Community not found' });
};

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as leaderboardController from '../controllers/leaderboardController';

const router = Router();

router.get('/top', leaderboardController.getTopLeaderboard);
router.get('/stats', authMiddleware, leaderboardController.getUserStats);

export default router;

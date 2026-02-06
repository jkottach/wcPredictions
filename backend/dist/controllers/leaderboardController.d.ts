import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getTopLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDailyLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunityLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=leaderboardController.d.ts.map
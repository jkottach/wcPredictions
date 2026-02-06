import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAllMatches: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMatchById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createMatch: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMatch: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=matchController.d.ts.map
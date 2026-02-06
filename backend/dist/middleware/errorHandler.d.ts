import { Request, Response, NextFunction } from 'express';
export interface ValidationError {
    field: string;
    message: string;
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map
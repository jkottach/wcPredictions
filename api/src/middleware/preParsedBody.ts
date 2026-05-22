import express, { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    _preParsedBody?: unknown;
    _bodyParsed?: boolean;
  }
}

/** Azure Functions adapter may set `_preParsedBody` before Express runs. */
export function applyPreParsedBody(req: Request, _res: Response, next: NextFunction): void {
  if (req._preParsedBody !== undefined) {
    req.body = req._preParsedBody;
    req._bodyParsed = true;
  }
  next();
}

/** Skip `express.json()` when the Azure adapter already supplied the body. */
export function jsonUnlessPreParsed(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req._bodyParsed) {
    return next();
  }
  return express.json({ limit: '10mb' })(req, res, next);
}

import type { Request, Response } from 'express';
import { getJwtExpiresIn } from '../config/jwtSecret';

export const AUTH_COOKIE_NAME = 'auth_token';

function cookieMaxAgeMs(): number {
  const raw = getJwtExpiresIn();
  if (raw.endsWith('d')) return parseInt(raw, 10) * 24 * 60 * 60 * 1000;
  if (raw.endsWith('h')) return parseInt(raw, 10) * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieMaxAgeMs(),
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function getTokenFromCookie(req: Request): string | undefined {
  const raw = req.headers.cookie;
  if (!raw || typeof raw !== 'string') return undefined;

  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (name !== AUTH_COOKIE_NAME) continue;
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return undefined;
}

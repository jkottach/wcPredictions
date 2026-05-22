import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/** `api/` package root (works when running from `src/` or compiled `dist/`). */
export function getApiPackageRoot(): string {
  return path.resolve(__dirname, '../..');
}

/** Load `api/.env` and optional `api/.env.local` (local overrides). */
export function loadApiEnv(): void {
  const root = getApiPackageRoot();

  for (const file of ['.env', '.env.local']) {
    const envPath = path.join(root, file);
    if (fs.existsSync(envPath)) {
      dotenv.config({
        path: envPath,
        override: file === '.env.local',
      });
    }
  }
}

loadApiEnv();

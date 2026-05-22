import type { Express } from 'express';
import { initDatabase, buildApp } from './app';

let ready: Promise<Express> | null = null;

/** Lazy-load Express app + MongoDB (cold start once per Azure Functions worker). */
export function getExpressApp(): Promise<Express> {
  if (!ready) {
    ready = (async () => {
      await initDatabase();
      return buildApp();
    })();
  }
  return ready;
}

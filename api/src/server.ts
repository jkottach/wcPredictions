import './config/loadEnv';
import { startServer } from './app';
import { logger } from './lib/logger';

startServer().catch((error) => {
  logger.error('startServer', error);
  process.exit(1);
});

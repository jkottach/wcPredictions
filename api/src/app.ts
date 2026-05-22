import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';
import { connectMongo, pingMongo } from './lib/mongodb';

import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import predictionRoutes from './routes/predictionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import communityRoutes from './routes/communityRoutes';
import adminRoutes from './routes/adminRoutes';

/** Connect MongoDB once per process (Express dev server or Azure Functions worker). */
export async function initDatabase(): Promise<void> {
  await connectMongo();
}

/** Build the Express app without listening (used by local server and Azure Functions). */
export function buildApp(): Express {
  const app = express();

  // Required behind Azure Static Web Apps / Functions (X-Forwarded-For)
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api/') && res.statusCode < 400) {
        logger.info('apiSuccess', 'API request completed successfully', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
        });
      }
    });
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', async (_req, res) => {
    const mongo = await pingMongo();
    const status = mongo.ok ? 'ok' : 'degraded';
    res.status(mongo.ok ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      runtime: 'express',
      mongo,
    });
  });

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/communities', communityRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
  });

  app.use(errorHandler);

  return app;
}

export async function startServer(): Promise<void> {
  await initDatabase();
  const app = buildApp();
  app.listen(config.server.port, () => {
    console.log(`✓ Server running on port ${config.server.port}`);
    console.log(`✓ Environment: ${config.server.nodeEnv}`);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

export default buildApp;

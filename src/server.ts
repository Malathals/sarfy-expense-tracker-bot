import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './lib/logger';
import { env } from './lib/env';
import { startScheduler } from './jobs/scheduler';

const app = express();
const PORT = env.PORT;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGIN ?? false }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use('/api', apiLimiter);

app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming request');
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT, env: env.NODE_ENV }, 'Server started');

  startScheduler();
});


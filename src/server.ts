import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './lib/logger';

const app = express();
const PORT = process.env['PORT'] ?? 2020;

app.use(helmet());
app.use(cors({ origin: process.env['ALLOWED_ORIGIN'] ?? false }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env['NODE_ENV'] ?? 'development' }, 'Server started');
});


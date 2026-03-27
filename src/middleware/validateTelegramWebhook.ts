import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { env } from '../lib/env';

export const validateTelegramWebhook = (req: Request, res: Response, next: NextFunction) => {
  logger.info({ body: req.body, headers: req.headers }, 'Webhook raw payload received');

  const secret = env.TELEGRAM_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn('TELEGRAM_WEBHOOK_SECRET not set, skipping validation');
    next();
    return;
  }

  const token = req.headers['x-telegram-bot-api-secret-token'];

  if (token !== secret) {
    logger.warn({ ip: req.ip, token }, 'Invalid Telegram webhook secret');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  logger.info({ ip: req.ip }, 'Webhook secret validated');
  next();
};

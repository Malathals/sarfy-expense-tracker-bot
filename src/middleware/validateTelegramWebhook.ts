import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { env } from '../lib/env';

export const validateTelegramWebhook = (req: Request, res: Response, next: NextFunction) => {
  const secret = env.TELEGRAM_WEBHOOK_SECRET;

  if (!secret) {
    next();
    return;
  }

  const token = req.headers['x-telegram-bot-api-secret-token'];

  if (token !== secret) {
    logger.warn({ ip: req.ip }, 'Invalid Telegram webhook secret');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
};

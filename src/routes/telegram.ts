import { IRouter, Router } from 'express';
import { webhookHandler } from '../controllers/telegram.controller';
import { validateTelegramWebhook } from '../middleware/validateTelegramWebhook';

const router: IRouter = Router();

router.post('/webhook', validateTelegramWebhook, webhookHandler);

export default router;

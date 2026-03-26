import { IRouter, Router } from 'express';
import { handleWebhook } from '../controllers/telegram.controller';
import { validateTelegramWebhook } from '../middleware/validateTelegramWebhook';

const router: IRouter = Router();

router.post('/webhook', validateTelegramWebhook, handleWebhook);

export default router;

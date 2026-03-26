import { IRouter, Router } from 'express';
import { handleWebhook } from '../controllers/telegram.controller';

const router: IRouter = Router();

router.post('/webhook', handleWebhook);

export default router;

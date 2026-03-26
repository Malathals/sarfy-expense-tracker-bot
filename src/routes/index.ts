import { Router, IRouter } from 'express';
import expensesRouter from './expenses';
import telegramRouter from './telegram';

const router: IRouter = Router();

router.use('/expenses', expensesRouter);
router.use('/telegram', telegramRouter);

export default router;

import { IRouter, Router } from 'express';
import { getExpensesHandler, getTodayExpensesHandler, createExpenseHandler } from '../controllers/expenses.controller';

const router: IRouter = Router();

router.get('/', getExpensesHandler);
router.get('/today', getTodayExpensesHandler);
router.post('/', createExpenseHandler);

export default router;

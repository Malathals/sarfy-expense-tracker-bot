import { IRouter, Router } from 'express';
import { getExpenses, getTodayExpenses, createExpense } from '../controllers/expenses.controller';

const router: IRouter = Router();
  
router.get('/', getExpenses);
router.get('/today', getTodayExpenses);
router.post('/', createExpense);

export default router;

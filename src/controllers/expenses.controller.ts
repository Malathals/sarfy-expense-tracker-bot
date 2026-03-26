import type { Request, Response, NextFunction } from 'express';
import { parseExpenseMessage } from '../utils/expense.utils';
import { getAllExpensesService, getTodayExpensesService, saveExpenseService } from '../services/expense.service';
import logger from '../lib/logger';

export const getExpensesHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await getAllExpensesService();
    logger.info({ count: expenses.length }, 'Fetched all expenses');
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

export const getTodayExpensesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const telegramId = req.query['telegramId'] ? Number(req.query['telegramId']) : undefined;
    const result = await getTodayExpensesService(telegramId);
    logger.info({ telegramId, count: result.expenses.length, total: result.total }, "Fetched today's expenses");
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createExpenseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      logger.warn('Create expense called with missing or invalid message');
      return res.status(400).json({ error: 'Message field is required' });
    }

    const parsed = parseExpenseMessage(message);
    if (!parsed) {
      logger.warn({ message }, 'Failed to parse expense message');
      return res.status(400).json({ error: 'Invalid expense format' });
    }

    const expense = await saveExpenseService(parsed.item, parsed.amount);
    logger.info({ item: expense.item, amount: expense.amount }, 'Expense created');
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

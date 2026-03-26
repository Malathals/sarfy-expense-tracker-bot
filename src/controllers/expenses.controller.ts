import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { parseExpenseMessage } from '../utils/expense.utils';
import { saveExpense } from '../services/expense.service';
import logger from '../lib/logger';

export const getExpenses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: 'desc' } });
    logger.info({ count: expenses.length }, 'Fetched all expenses');
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

export const getTodayExpenses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: 'desc' },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    logger.info({ count: expenses.length, total }, "Fetched today's expenses");
    res.json({ expenses, total });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
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

    const expense = await saveExpense(parsed.item, parsed.amount);
    logger.info({ item: expense.item, amount: expense.amount }, 'Expense created');
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

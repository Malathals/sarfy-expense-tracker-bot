import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export const getAllExpensesService = async () => {
  const expenses = await prisma.expense.findMany({ orderBy: { createdAt: 'desc' } });
  logger.info({ count: expenses.length }, 'Fetched all expenses');
  return expenses;
};

export const getTodayExpensesService = async (telegramId?: number) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const expenses = await prisma.expense.findMany({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
      ...(telegramId ? { telegramId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  logger.info({ telegramId, count: expenses.length, total }, "Fetched today's expenses");
  return { expenses, total };
};

export const getUsersWithNoExpensesTodayService = async (): Promise<number[]> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const allUsers = await prisma.expense.findMany({
    select: { telegramId: true },
    distinct: ['telegramId'],
    where: { telegramId: { not: null } },
  });

  const activeToday = await prisma.expense.findMany({
    select: { telegramId: true },
    distinct: ['telegramId'],
    where: {
      telegramId: { not: null },
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const inactiveUsers = allUsers
    .map((e) => e.telegramId as number)
    .filter((id) => !activeToday.some((e) => e.telegramId === id));

  logger.info({ count: inactiveUsers.length }, 'Users with no expenses today');
  return inactiveUsers;
};

export const getTotalExpensesService = async (telegramId: number) => {
  const result = await prisma.expense.aggregate({
    where: { telegramId },
    _sum: { amount: true },
    _count: true,
  });
  const total = result._sum.amount ?? 0;
  const count = result._count;
  logger.info({ telegramId, total, count }, 'Fetched total expenses');
  return { total, count };
};

export const saveExpenseService = async (
  item: string,
  amount: number,
  provider?: string,
  telegramId?: number
) => {
  const expense = await prisma.expense.create({
    data: { item, amount, provider: provider ?? null, telegramId: telegramId ?? null },
  });
  logger.info({ id: expense.id, item, amount, provider, telegramId }, 'Expense saved');
  return expense;
};

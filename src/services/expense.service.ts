import { prisma } from '../lib/prisma';

export const getAllExpensesService = async () => {
  return prisma.expense.findMany({ orderBy: { createdAt: 'desc' } });
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

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { expenses, total };
};

export const saveExpenseService = async (
  item: string,
  amount: number,
  provider?: string
) => {
  return prisma.expense.create({
    data: { item, amount, provider: provider ?? null },
  });
};

import { prisma } from '../lib/prisma';

export const saveExpense = async (
  item: string,
  amount: number,
  provider?: string
) => {
  return prisma.expense.create({
    data: { item, amount, provider: provider ?? null },
  });
};

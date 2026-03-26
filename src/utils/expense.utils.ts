export const EXPENSE_FORMAT_HINT =
  'Invalid format. Send: <item> <amount>\nExample: coffee 18\nأو: قهوة 18';

export const parseExpenseMessage = (
  message: string
): { item: string; amount: number } | null => {
  const parts = message.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const amount = Number(parts[parts.length - 1]);
  if (Number.isNaN(amount) || amount <= 0) return null;

  const item = parts.slice(0, -1).join(' ');
  if (!item) return null;

  return { item, amount };
};

export const parseTransactionMessage = (
  message: string
): { amount: number; provider: string } | null => {
  const amountMatch = message.match(/بـSAR\s+([\d.]+)/);
  const providerMatch = message.match(/لـ(\S+)/);

  if (!amountMatch || !providerMatch) return null;

  const amount = Number(amountMatch[1]);
  if (Number.isNaN(amount) || amount <= 0) return null;

  return { amount, provider: providerMatch[1]! };
};

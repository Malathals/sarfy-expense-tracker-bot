export const EXPENSE_FORMAT_HINT =
  'Invalid format. Send: <item> <amount>\nExample: coffee 18\nأو: قهوة 18';

/**
 * Parses a manual expense message in the format: "<item> <amount>"
 * Example: "coffee 18" → { item: "coffee", amount: 18 }
 * Returns null if the format is invalid.
 */
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

/**
 * Parses a bank transaction notification message.
 * Supports two formats:
 * - Arabic: "بـSAR <amount> ... لـ<provider>"
 * - English POS: "POS Purchase\nAmount <amount> SAR\nAt <provider>\n..."
 * Returns null if the message is not a recognized bank transaction.
 */
export const parseTransactionMessage = (
  message: string
): { amount: number; provider: string } | null => {
  // Arabic bank SMS format
  const arabicAmountMatch = message.match(/بـSAR\s+([\d.]+)/);
  const arabicProviderMatch = message.match(/لـ(\S+)/);
  if (arabicAmountMatch && arabicProviderMatch) {
    const amount = Number(arabicAmountMatch[1]);
    if (Number.isNaN(amount) || amount <= 0) return null;
    return { amount, provider: arabicProviderMatch[1]! };
  }

  // English POS format: "Amount 74 SAR" and "At Third Way"
  const englishAmountMatch = message.match(/Amount\s+([\d.]+)\s+SAR/i);
  const englishProviderMatch = message.match(/At\s+(.+)/i);
  if (englishAmountMatch && englishProviderMatch) {
    const amount = Number(englishAmountMatch[1]);
    if (Number.isNaN(amount) || amount <= 0) return null;
    return { amount, provider: englishProviderMatch[1]!.trim() };
  }

  return null;
};

import type { Request, Response, NextFunction } from 'express';
import { sendTelegramMessage } from '../utils/telegram.utils';
import { parseExpenseMessage, parseTransactionMessage, EXPENSE_FORMAT_HINT } from '../utils/expense.utils';
import { saveExpenseService, getTodayExpensesService } from '../services/expense.service';
import logger from '../lib/logger';

const pending = new Map<number, { amount: number; provider: string }>();

const handleTodayCommand = async (telegramId: number) => {
  const { expenses, total } = await getTodayExpensesService(telegramId);

  if (expenses.length === 0) {
    await sendTelegramMessage(telegramId, 'No expenses recorded today.');
    return;
  }

  const lines = expenses.map(
    (e: { item: string; amount: number; provider: string | null }) =>
      `• ${e.item}${e.provider ? ` (${e.provider})` : ''} — ${e.amount} SAR`
  );

  const message = [
    `Today's Expenses`,
    ``,
    ...lines,
    ``,
    `Transactions: ${expenses.length}`,
    `Total: ${total} SAR`,
  ].join('\n');

  await sendTelegramMessage(telegramId, message);
  logger.info({ telegramId, total }, '/today command served');
};

export const webhookHandler = async (req: Request, res: Response, _next: NextFunction) => {
  // Respond 200 immediately — if Telegram doesn't get a quick response it will retry the same message repeatedly
  res.sendStatus(200);

  try {
    const telegramId = req.body?.message?.from?.id;
    const messageText = req.body?.message?.text;

    logger.info({ telegramId, messageText, updateType: Object.keys(req.body ?? {}) }, 'Webhook handler received');

    if (!telegramId || !messageText) {
      logger.warn({ telegramId, messageText }, 'Webhook received with missing telegramId or messageText');
      return;
    }

    logger.info({ telegramId, messageText }, 'Telegram message received');

    if (messageText === '/today') {
      await handleTodayCommand(telegramId);
      return;
    }

    if (pending.has(telegramId)) {
      const { amount, provider } = pending.get(telegramId)!;
      pending.delete(telegramId);

      const expense = await saveExpenseService(messageText.trim(), amount, provider, telegramId);
      logger.info({ telegramId, item: expense.item, amount, provider }, 'Pending expense saved');
      await sendTelegramMessage(telegramId, `Saved! ${expense.item} — ${expense.amount} SAR at ${expense.provider}`);
      return;
    }

    const transaction = parseTransactionMessage(messageText);
    if (transaction) {
      logger.info({ telegramId, ...transaction }, 'Bank transaction detected, awaiting item');
      pending.set(telegramId, transaction);
      await sendTelegramMessage(telegramId, `Got it! ${transaction.amount} SAR at ${transaction.provider}\nWhat did you buy?`);
      return;
    }

    const parsed = parseExpenseMessage(messageText);
    if (!parsed) {
      logger.warn({ telegramId, messageText }, 'Unrecognized message format');
      await sendTelegramMessage(telegramId, EXPENSE_FORMAT_HINT);
      return;
    }

    const expense = await saveExpenseService(parsed.item, parsed.amount, undefined, telegramId);
    logger.info({ telegramId, item: expense.item, amount: expense.amount }, 'Manual expense saved');
    await sendTelegramMessage(telegramId, `Saved! ${expense.item} — ${expense.amount} SAR`);
  } catch (error) {
    //telegram will retry the same message if we don't respond with 200, so we catch all errors here and log them without throwing
    logger.error({ error }, 'Webhook error');
  }
};

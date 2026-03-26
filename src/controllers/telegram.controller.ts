import type { Request, Response, NextFunction } from 'express';
import { sendTelegramMessage } from '../utils/telegram.utils';
import { parseExpenseMessage, parseTransactionMessage, EXPENSE_FORMAT_HINT } from '../utils/expense.utils';
import { saveExpenseService, getTodayExpensesService } from '../services/expense.service';
import logger from '../lib/logger';

const pending = new Map<number, { amount: number; provider: string }>();

const handleTodayCommand = async (chatId: number, telegramId: number) => {
  const { expenses, total } = await getTodayExpensesService(telegramId);

  if (expenses.length === 0) {
    await sendTelegramMessage(chatId, 'No expenses recorded today.');
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

  await sendTelegramMessage(chatId, message);
  logger.info({ telegramId, total }, '/today command served');
};

export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  res.sendStatus(200);

  try {
    const chatId = req.body?.message?.chat?.id;
    const telegramId = req.body?.message?.from?.id;
    const messageText = req.body?.message?.text;

    if (!chatId || !messageText) {
      logger.warn('Webhook received with missing chatId or messageText');
      return;
    }

    logger.info({ chatId, telegramId, messageText }, 'Telegram message received');

    if (messageText === '/today') {
      await handleTodayCommand(chatId, telegramId);
      return;
    }

    if (pending.has(chatId)) {
      const { amount, provider } = pending.get(chatId)!;
      pending.delete(chatId);

      const expense = await saveExpenseService(messageText.trim(), amount, provider);
      logger.info({ chatId, item: expense.item, amount, provider }, 'Pending expense saved');
      await sendTelegramMessage(
        chatId,
        `Saved! ${expense.item} — ${expense.amount} SAR at ${expense.provider}`
      );
      return;
    }

    const transaction = parseTransactionMessage(messageText);
    if (transaction) {
      logger.info({ chatId, ...transaction }, 'Bank transaction detected, awaiting item');
      pending.set(chatId, transaction);
      await sendTelegramMessage(
        chatId,
        `Got it! ${transaction.amount} SAR at ${transaction.provider}\nWhat did you buy?`
      );
      return;
    }

    const parsed = parseExpenseMessage(messageText);
    if (!parsed) {
      logger.warn({ chatId, messageText }, 'Unrecognized message format');
      await sendTelegramMessage(chatId, EXPENSE_FORMAT_HINT);
      return;
    }

    const expense = await saveExpenseService(parsed.item, parsed.amount);
    logger.info({ chatId, item: expense.item, amount: expense.amount }, 'Manual expense saved');
    await sendTelegramMessage(
      chatId,
      `Saved! ${expense.item} — ${expense.amount} SAR`
    );
  } catch (error) {
    logger.error({ error }, 'Webhook error');
    next(error);
  }
};

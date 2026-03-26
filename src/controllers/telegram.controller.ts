import type { Request, Response, NextFunction } from 'express';
import { sendTelegramMessage } from '../utils/telegram.utils';
import { parseExpenseMessage, parseTransactionMessage, EXPENSE_FORMAT_HINT } from '../utils/expense.utils';
import { saveExpense } from '../services/expense.service';
import logger from '../lib/logger';

// Pending transactions waiting for item name: chatId 
const pending = new Map<number, { amount: number; provider: string }>();

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  res.sendStatus(200);

  try {
    const chatId = req.body?.message?.chat?.id;
    const messageText = req.body?.message?.text;

    if (!chatId || !messageText) {
      logger.warn('Webhook received with missing chatId or messageText');
      return;
    }

    logger.info({ chatId, messageText }, 'Telegram message received');

    // User is replying with item name for a pending transaction
    if (pending.has(chatId)) {
      const { amount, provider } = pending.get(chatId)!;
      pending.delete(chatId);

      const expense = await saveExpense(messageText.trim(), amount, provider);
      logger.info({ chatId, item: expense.item, amount, provider }, 'Pending expense saved');
      await sendTelegramMessage(
        chatId,
        `Saved! ${expense.item} — ${expense.amount} SAR at ${expense.provider}`
      );
      return;
    }

    // Try parsing as bank transaction
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

    // Try parsing as manual format: "coffee 18"
    const parsed = parseExpenseMessage(messageText);
    if (!parsed) {
      logger.warn({ chatId, messageText }, 'Unrecognized message format');
      await sendTelegramMessage(chatId, EXPENSE_FORMAT_HINT);
      return;
    }

    const expense = await saveExpense(parsed.item, parsed.amount);
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

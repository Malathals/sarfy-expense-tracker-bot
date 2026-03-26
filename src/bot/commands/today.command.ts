import type TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import logger from '../../lib/logger';
import { env } from '../../lib/env';

interface TodayResponse {
  expenses: { item: string; amount: number; provider: string | null }[];
  total: number;
}

export const todayCommand = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id;

  if (!telegramId) {
    await bot.sendMessage(chatId, 'Could not identify your account.');
    return;
  }

  try {
    const { data } = await axios.get<TodayResponse>(
      `${env.BACKEND_URL}/api/v1/expenses/today`,
      { params: { telegramId } }
    );

    if (data.expenses.length === 0) {
      await bot.sendMessage(chatId, 'No expenses recorded today.');
      return;
    }

    const lines = data.expenses.map(
      (e) => `• ${e.item}${e.provider ? ` (${e.provider})` : ''} — ${e.amount} SAR`
    );

    const message = [
      `Today's Expenses`,
      ``,
      ...lines,
      ``,
      `Transactions: ${data.expenses.length}`,
      `Total: ${data.total} SAR`,
    ].join('\n');

    await bot.sendMessage(chatId, message);
    logger.info({ telegramId, total: data.total }, '/today command served');
  } catch (error) {
    logger.error({ error, telegramId }, '/today command failed');
    await bot.sendMessage(chatId, 'Failed to fetch expenses. Please try again.');
  }
};

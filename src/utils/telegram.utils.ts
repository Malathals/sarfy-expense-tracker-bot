import logger from '../lib/logger';
import { env } from '../lib/env';

export const sendTelegramMessage = async (chatId: number, text: string) => {
  const token = env.TELEGRAM_BOT_TOKEN;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to send Telegram message');
  }
};

import { env } from '../lib/env';
import TelegramBot from 'node-telegram-bot-api';
import logger from '../lib/logger';
import { todayCommand } from './commands/today.command';

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/today/, (msg) => todayCommand(bot, msg));

bot.on('polling_error', (error) => {
  logger.error({ error }, 'Telegram polling error');
});

logger.info('Bot is running');

export default bot;

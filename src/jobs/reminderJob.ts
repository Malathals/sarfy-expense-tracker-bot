import { getUsersWithNoExpensesTodayService } from '../services/expense.service';
import { sendTelegramMessage } from '../utils/telegram.utils';
import logger from '../lib/logger';

// Runs at 10 PM Saudi time (UTC+3 = 19:00 UTC)
// Cron: "0 19 * * *"
export const runReminderJob = async () => {
  logger.info('Running daily expense reminder job');

  const inactiveUsers = await getUsersWithNoExpensesTodayService();

  if (inactiveUsers.length === 0) {
    logger.info('All users have logged expenses today, no reminders sent');
    return;
  }

  for (const telegramId of inactiveUsers) {
    await sendTelegramMessage(telegramId, `Hey! 👋 You haven't logged any expenses today.\nSend me your expenses now so you don't lose track!`);
    logger.info({ telegramId }, 'Reminder sent');
  }

  logger.info({ count: inactiveUsers.length }, 'Daily reminder job completed');
};

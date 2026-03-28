import cron from 'node-cron';
import logger from '../lib/logger';
import { runReminderJob } from './reminderJob';

export const startScheduler = () => {
  // 10 PM Saudi time (UTC+3) = 19:00 UTC
  cron.schedule('0 19 * * *', () => {
    runReminderJob().catch((err) => logger.error({ err }, 'Reminder job failed'));
  }, { timezone: 'UTC' });

  logger.info('Daily reminder cron job scheduled at 22:00 Asia/Riyadh');
};

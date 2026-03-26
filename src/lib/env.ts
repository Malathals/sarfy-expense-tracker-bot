import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  BACKEND_URL: z.string().url(),
  PORT: z.coerce.number().default(2020),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load local .env first (services/node-api/.env), then root .env as fallback.
// dotenv does NOT override already-set variables, so local values take precedence.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://127.0.0.1:16379'),
  JWT_SECRET: z.string().default('super_secret_koi_bus_key_1234'),
  JWT_REFRESH_SECRET: z.string().default('fallback_refresh_secret_change_in_prod'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

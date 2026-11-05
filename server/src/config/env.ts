import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/scancart'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars').default('scancart_jwt_super_secret_production_key_2026_change_in_prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RECEIPT_SECRET: z.string().min(16, 'RECEIPT_SECRET must be at least 16 chars').default('scancart_hmac_sha256_receipt_secret_key_84920491'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mockKeyId12345'),
  RAZORPAY_KEY_SECRET: z.string().default('mockKeySecretValue98765'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('mockWebhookSecretValue123'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

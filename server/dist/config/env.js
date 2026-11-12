"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    MONGODB_URI: zod_1.z.string().default('mongodb://127.0.0.1:27017/scancart'),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET must be at least 16 chars').default('scancart_jwt_super_secret_production_key_2026_change_in_prod'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    RECEIPT_SECRET: zod_1.z.string().min(16, 'RECEIPT_SECRET must be at least 16 chars').default('scancart_hmac_sha256_receipt_secret_key_84920491'),
    RAZORPAY_KEY_ID: zod_1.z.string().default('rzp_test_mockKeyId12345'),
    RAZORPAY_KEY_SECRET: zod_1.z.string().default('mockKeySecretValue98765'),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().default('mockWebhookSecretValue123'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.warn('⚠️ Environment variable validation warnings:', parsedEnv.error.format());
}
exports.env = parsedEnv.success
    ? parsedEnv.data
    : {
        PORT: process.env.PORT || '5000',
        NODE_ENV: (['development', 'production', 'test'].includes(process.env.NODE_ENV || '')
            ? process.env.NODE_ENV
            : 'production'),
        CLIENT_URL: process.env.CLIENT_URL || 'https://scancart-cloud.vercel.app',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scancart',
        JWT_SECRET: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16
            ? process.env.JWT_SECRET
            : 'scancart_jwt_super_secret_production_key_2026_change_in_prod',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        RECEIPT_SECRET: process.env.RECEIPT_SECRET && process.env.RECEIPT_SECRET.length >= 16
            ? process.env.RECEIPT_SECRET
            : 'scancart_hmac_sha256_receipt_secret_key_84920491',
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mockKeySecretValue98765',
        RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'mockWebhookSecretValue123',
    };

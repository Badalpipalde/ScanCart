"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    MONGODB_URI: zod_1.z.string().default('mongodb://127.0.0.1:27017/scancart'),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    RECEIPT_SECRET: zod_1.z.string().min(16, 'RECEIPT_SECRET must be at least 16 chars'),
    RAZORPAY_KEY_ID: zod_1.z.string().default('rzp_test_mockKeyId12345'),
    RAZORPAY_KEY_SECRET: zod_1.z.string().default('mockKeySecretValue98765'),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().default('mockWebhookSecretValue123'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;

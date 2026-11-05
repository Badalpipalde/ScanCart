"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crypto_1 = __importDefault(require("crypto"));
const payment_service_1 = require("../services/payment.service");
const env_1 = require("../config/env");
(0, vitest_1.describe)('Payment Service Signature Verification', () => {
    (0, vitest_1.it)('should accept mock signatures when running in mock mode', () => {
        const isValid = payment_service_1.PaymentService.verifySignature('order_mock_123', 'pay_mock_456', 'mock_valid_signature');
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should verify real HMAC-SHA256 signature calculated from razorpayOrderId|razorpayPaymentId', () => {
        const orderId = 'order_test_987654';
        const paymentId = 'pay_test_123456';
        const payload = `${orderId}|${paymentId}`;
        const validSignature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET)
            .update(payload)
            .digest('hex');
        const isValid = payment_service_1.PaymentService.verifySignature(orderId, paymentId, validSignature);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should reject invalid or forged signatures', () => {
        const isValid = payment_service_1.PaymentService.verifySignature('order_test_987654', 'pay_test_123456', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
        (0, vitest_1.expect)(isValid).toBe(false);
    });
});

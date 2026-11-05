"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const razorpay_1 = require("../config/razorpay");
const apiError_1 = require("../utils/apiError");
class PaymentService {
    /**
     * Creates an order with Razorpay in currency subunit (Paise for INR)
     */
    static async createOrder({ amountInRupees, receiptId, notes = {}, }) {
        const amountInSubunits = Math.round(amountInRupees * 100);
        if (amountInSubunits <= 0) {
            throw apiError_1.ApiError.badRequest('Order amount must be greater than zero');
        }
        if (razorpay_1.isMockRazorpay) {
            const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            return {
                id: mockOrderId,
                amount: amountInSubunits,
                currency: 'INR',
                receipt: receiptId,
            };
        }
        try {
            const order = await razorpay_1.razorpayInstance.orders.create({
                amount: amountInSubunits,
                currency: 'INR',
                receipt: receiptId,
                notes,
            });
            return {
                id: order.id,
                amount: Number(order.amount),
                currency: order.currency,
                receipt: order.receipt || receiptId,
            };
        }
        catch (err) {
            console.error('Razorpay order creation failed:', err);
            throw apiError_1.ApiError.badRequest(`Failed to initiate payment gateway order: ${err.message}`);
        }
    }
    /**
     * Verifies Razorpay payment signature idempotently
     */
    static verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return false;
        }
        if (razorpay_1.isMockRazorpay) {
            // Allow mock test signature if in mock mode
            if (razorpaySignature === 'mock_valid_signature' ||
                razorpaySignature.startsWith('mock_sig_')) {
                return true;
            }
        }
        const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET)
            .update(payload)
            .digest('hex');
        try {
            return crypto_1.default.timingSafeEqual(Buffer.from(razorpaySignature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Verifies Razorpay Webhook signature
     */
    static verifyWebhookSignature(body, webhookSignature) {
        if (!body || !webhookSignature)
            return false;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
        try {
            return crypto_1.default.timingSafeEqual(Buffer.from(webhookSignature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        }
        catch {
            return false;
        }
    }
}
exports.PaymentService = PaymentService;

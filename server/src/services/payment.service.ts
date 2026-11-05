import crypto from 'crypto';
import { env } from '../config/env';
import { razorpayInstance, isMockRazorpay } from '../config/razorpay';
import { ApiError } from '../utils/apiError';

export interface CreateOrderParams {
  amountInRupees: number;
  receiptId: string;
  notes?: Record<string, string>;
}

export class PaymentService {
  /**
   * Creates an order with Razorpay in currency subunit (Paise for INR)
   */
  public static async createOrder({
    amountInRupees,
    receiptId,
    notes = {},
  }: CreateOrderParams): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  }> {
    const amountInSubunits = Math.round(amountInRupees * 100);

    if (amountInSubunits <= 0) {
      throw ApiError.badRequest('Order amount must be greater than zero');
    }

    if (isMockRazorpay) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        id: mockOrderId,
        amount: amountInSubunits,
        currency: 'INR',
        receipt: receiptId,
      };
    }

    try {
      const order = await razorpayInstance.orders.create({
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
    } catch (err: any) {
      console.error('Razorpay order creation failed:', err);
      throw ApiError.badRequest(`Failed to initiate payment gateway order: ${err.message}`);
    }
  }

  /**
   * Verifies Razorpay payment signature idempotently
   */
  public static verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    if (isMockRazorpay) {
      // Allow mock test signature if in mock mode
      if (
        razorpaySignature === 'mock_valid_signature' ||
        razorpaySignature.startsWith('mock_sig_')
      ) {
        return true;
      }
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(razorpaySignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (err) {
      return false;
    }
  }

  /**
   * Verifies Razorpay Webhook signature
   */
  public static verifyWebhookSignature(body: string, webhookSignature: string): boolean {
    if (!body || !webhookSignature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(webhookSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }
}

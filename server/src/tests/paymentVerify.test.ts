import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { PaymentService } from '../services/payment.service';
import { env } from '../config/env';

describe('Payment Service Signature Verification', () => {
  it('should accept mock signatures when running in mock mode', () => {
    const isValid = PaymentService.verifySignature(
      'order_mock_123',
      'pay_mock_456',
      'mock_valid_signature'
    );
    expect(isValid).toBe(true);
  });

  it('should verify real HMAC-SHA256 signature calculated from razorpayOrderId|razorpayPaymentId', () => {
    const orderId = 'order_test_987654';
    const paymentId = 'pay_test_123456';
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = PaymentService.verifySignature(orderId, paymentId, validSignature);
    expect(isValid).toBe(true);
  });

  it('should reject invalid or forged signatures', () => {
    const isValid = PaymentService.verifySignature(
      'order_test_987654',
      'pay_test_123456',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    expect(isValid).toBe(false);
  });
});

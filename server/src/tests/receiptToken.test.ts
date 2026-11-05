import { describe, it, expect } from 'vitest';
import { ReceiptService } from '../services/receipt.service';

describe('Receipt Cryptographic Token Service', () => {
  const samplePayload = {
    orderId: '65a1b2c3d4e5f6a7b8c9d0e1',
    subtotal: 500.0,
    tax: 25.0,
    total: 525.0,
    itemCount: 2,
    items: [
      { name: 'Organic Hass Avocados', sku: 'AVO-ORG-003', qty: 2, unitPrice: 250 },
    ],
    createdAt: new Date().toISOString(),
  };

  it('should generate an encoded token with valid HMAC signature', () => {
    const token = ReceiptService.createReceiptToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(50);

    const verification = ReceiptService.verifyReceiptToken(token);
    expect(verification.isValid).toBe(true);
    expect(verification.payload?.orderId).toBe(samplePayload.orderId);
    expect(verification.payload?.total).toBe(samplePayload.total);
  });

  it('should reject tampered token payloads', () => {
    const token = ReceiptService.createReceiptToken(samplePayload);
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));

    // Tamper with order total
    decoded.total = 1.0;
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const verification = ReceiptService.verifyReceiptToken(tamperedToken);
    expect(verification.isValid).toBe(false);
    expect(verification.error).toContain('Invalid receipt cryptographic signature');
  });

  it('should fail gracefully on garbage or corrupt token string', () => {
    const verification = ReceiptService.verifyReceiptToken('invalid-token-string-xyz');
    expect(verification.isValid).toBe(false);
  });
});

import crypto from 'crypto';
import { env } from '../config/env';

export interface ReceiptPayload {
  orderId: string;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  items: Array<{
    name: string;
    sku: string;
    qty: number;
    unitPrice: number;
  }>;
  createdAt: string;
}

export class ReceiptService {
  /**
   * Generates an HMAC-SHA256 signature for receipt data
   */
  public static generateSignature(orderId: string, total: number, createdAt: string): string {
    const rawPayload = `${orderId}:${total.toFixed(2)}:${createdAt}`;
    return crypto.createHmac('sha256', env.RECEIPT_SECRET).update(rawPayload).digest('hex');
  }

  /**
   * Creates an encoded receipt token encapsulating order information and signature
   */
  public static createReceiptToken(payload: ReceiptPayload): string {
    const signature = this.generateSignature(payload.orderId, payload.total, payload.createdAt);
    const tokenObject = {
      ...payload,
      sig: signature,
    };
    return Buffer.from(JSON.stringify(tokenObject)).toString('base64url');
  }

  /**
   * Decodes and verifies a receipt token
   */
  public static verifyReceiptToken(token: string): {
    isValid: boolean;
    payload?: ReceiptPayload & { sig: string };
    error?: string;
  } {
    try {
      const decodedString = Buffer.from(token, 'base64url').toString('utf-8');
      const data = JSON.parse(decodedString);

      if (!data.orderId || !data.total || !data.createdAt || !data.sig) {
        return { isValid: false, error: 'Malformed receipt token structure' };
      }

      const expectedSig = this.generateSignature(data.orderId, data.total, data.createdAt);

      const isSigMatch = crypto.timingSafeEqual(
        Buffer.from(data.sig, 'hex'),
        Buffer.from(expectedSig, 'hex')
      );

      if (!isSigMatch) {
        return { isValid: false, error: 'Invalid receipt cryptographic signature' };
      }

      return { isValid: true, payload: data };
    } catch (err: any) {
      return { isValid: false, error: 'Failed to decode or verify token: ' + err.message };
    }
  }
}

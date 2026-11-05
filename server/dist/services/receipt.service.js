"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
class ReceiptService {
    /**
     * Generates an HMAC-SHA256 signature for receipt data
     */
    static generateSignature(orderId, total, createdAt) {
        const rawPayload = `${orderId}:${total.toFixed(2)}:${createdAt}`;
        return crypto_1.default.createHmac('sha256', env_1.env.RECEIPT_SECRET).update(rawPayload).digest('hex');
    }
    /**
     * Creates an encoded receipt token encapsulating order information and signature
     */
    static createReceiptToken(payload) {
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
    static verifyReceiptToken(token) {
        try {
            const decodedString = Buffer.from(token, 'base64url').toString('utf-8');
            const data = JSON.parse(decodedString);
            if (!data.orderId || !data.total || !data.createdAt || !data.sig) {
                return { isValid: false, error: 'Malformed receipt token structure' };
            }
            const expectedSig = this.generateSignature(data.orderId, data.total, data.createdAt);
            const isSigMatch = crypto_1.default.timingSafeEqual(Buffer.from(data.sig, 'hex'), Buffer.from(expectedSig, 'hex'));
            if (!isSigMatch) {
                return { isValid: false, error: 'Invalid receipt cryptographic signature' };
            }
            return { isValid: true, payload: data };
        }
        catch (err) {
            return { isValid: false, error: 'Failed to decode or verify token: ' + err.message };
        }
    }
}
exports.ReceiptService = ReceiptService;

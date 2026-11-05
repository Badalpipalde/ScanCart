"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const receipt_service_1 = require("../services/receipt.service");
(0, vitest_1.describe)('Receipt Cryptographic Token Service', () => {
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
    (0, vitest_1.it)('should generate an encoded token with valid HMAC signature', () => {
        const token = receipt_service_1.ReceiptService.createReceiptToken(samplePayload);
        (0, vitest_1.expect)(typeof token).toBe('string');
        (0, vitest_1.expect)(token.length).toBeGreaterThan(50);
        const verification = receipt_service_1.ReceiptService.verifyReceiptToken(token);
        (0, vitest_1.expect)(verification.isValid).toBe(true);
        (0, vitest_1.expect)(verification.payload?.orderId).toBe(samplePayload.orderId);
        (0, vitest_1.expect)(verification.payload?.total).toBe(samplePayload.total);
    });
    (0, vitest_1.it)('should reject tampered token payloads', () => {
        const token = receipt_service_1.ReceiptService.createReceiptToken(samplePayload);
        const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
        // Tamper with order total
        decoded.total = 1.0;
        const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64url');
        const verification = receipt_service_1.ReceiptService.verifyReceiptToken(tamperedToken);
        (0, vitest_1.expect)(verification.isValid).toBe(false);
        (0, vitest_1.expect)(verification.error).toContain('Invalid receipt cryptographic signature');
    });
    (0, vitest_1.it)('should fail gracefully on garbage or corrupt token string', () => {
        const verification = receipt_service_1.ReceiptService.verifyReceiptToken('invalid-token-string-xyz');
        (0, vitest_1.expect)(verification.isValid).toBe(false);
    });
});

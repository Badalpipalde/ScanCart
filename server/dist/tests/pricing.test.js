"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const calculatePricing_1 = require("../utils/calculatePricing");
(0, vitest_1.describe)('Pricing Calculation Utility', () => {
    (0, vitest_1.it)('should round numbers to 2 decimal places correctly', () => {
        (0, vitest_1.expect)((0, calculatePricing_1.roundToTwoDecimals)(10.555)).toBe(10.56);
        (0, vitest_1.expect)((0, calculatePricing_1.roundToTwoDecimals)(10.554)).toBe(10.55);
        (0, vitest_1.expect)((0, calculatePricing_1.roundToTwoDecimals)(0)).toBe(0);
    });
    (0, vitest_1.it)('should compute zero subtotal and tax for empty items', () => {
        const result = (0, calculatePricing_1.calculateOrderPricing)([]);
        (0, vitest_1.expect)(result.subtotal).toBe(0);
        (0, vitest_1.expect)(result.tax).toBe(0);
        (0, vitest_1.expect)(result.total).toBe(0);
        (0, vitest_1.expect)(result.itemCount).toBe(0);
    });
    (0, vitest_1.it)('should compute exact subtotal, tax, and total for multiple items', () => {
        const items = [
            { price: 180, taxPercent: 0, qty: 2 }, // subtotal: 360, tax: 0
            { price: 140, taxPercent: 5, qty: 1 }, // subtotal: 140, tax: 7
            { price: 160, taxPercent: 18, qty: 3 }, // subtotal: 480, tax: 86.4
        ];
        const result = (0, calculatePricing_1.calculateOrderPricing)(items);
        (0, vitest_1.expect)(result.subtotal).toBe(980);
        (0, vitest_1.expect)(result.tax).toBe(93.4);
        (0, vitest_1.expect)(result.total).toBe(1073.4);
        (0, vitest_1.expect)(result.itemCount).toBe(6);
    });
});

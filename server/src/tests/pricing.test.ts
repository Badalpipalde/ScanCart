import { describe, it, expect } from 'vitest';
import { calculateOrderPricing, roundToTwoDecimals } from '../utils/calculatePricing';

describe('Pricing Calculation Utility', () => {
  it('should round numbers to 2 decimal places correctly', () => {
    expect(roundToTwoDecimals(10.555)).toBe(10.56);
    expect(roundToTwoDecimals(10.554)).toBe(10.55);
    expect(roundToTwoDecimals(0)).toBe(0);
  });

  it('should compute zero subtotal and tax for empty items', () => {
    const result = calculateOrderPricing([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
    expect(result.itemCount).toBe(0);
  });

  it('should compute exact subtotal, tax, and total for multiple items', () => {
    const items = [
      { price: 180, taxPercent: 0, qty: 2 }, // subtotal: 360, tax: 0
      { price: 140, taxPercent: 5, qty: 1 }, // subtotal: 140, tax: 7
      { price: 160, taxPercent: 18, qty: 3 }, // subtotal: 480, tax: 86.4
    ];

    const result = calculateOrderPricing(items);
    expect(result.subtotal).toBe(980);
    expect(result.tax).toBe(93.4);
    expect(result.total).toBe(1073.4);
    expect(result.itemCount).toBe(6);
  });
});

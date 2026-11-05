export interface PricingItem {
  price: number;
  taxPercent: number;
  qty: number;
}

export interface PricingResult {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateOrderPricing(items: PricingItem[]): PricingResult {
  let subtotal = 0;
  let tax = 0;
  let itemCount = 0;

  for (const item of items) {
    const itemSubtotal = item.price * item.qty;
    const itemTax = itemSubtotal * ((item.taxPercent || 0) / 100);

    subtotal += itemSubtotal;
    tax += itemTax;
    itemCount += item.qty;
  }

  const roundedSubtotal = roundToTwoDecimals(subtotal);
  const roundedTax = roundToTwoDecimals(tax);
  const roundedTotal = roundToTwoDecimals(roundedSubtotal + roundedTax);

  return {
    subtotal: roundedSubtotal,
    tax: roundedTax,
    total: roundedTotal,
    itemCount,
  };
}

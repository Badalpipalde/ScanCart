"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToTwoDecimals = roundToTwoDecimals;
exports.calculateOrderPricing = calculateOrderPricing;
function roundToTwoDecimals(val) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
}
function calculateOrderPricing(items) {
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

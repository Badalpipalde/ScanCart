"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartItemSchema = exports.updateCartItemSchema = exports.addCartItemSchema = void 0;
const zod_1 = require("zod");
exports.addCartItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
        qty: zod_1.z.number().int().min(1, 'Quantity must be at least 1').default(1),
    }),
});
exports.updateCartItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
    }),
    body: zod_1.z.object({
        qty: zod_1.z.number().int().min(0, 'Quantity must be 0 or greater'),
    }),
});
exports.deleteCartItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
    }),
});

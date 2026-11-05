"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barcodeParamSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(120),
        sku: zod_1.z.string().min(3).max(30),
        barcode: zod_1.z.string().min(4).max(30),
        price: zod_1.z.number().min(0, 'Price must be positive'),
        taxPercent: zod_1.z.number().min(0).max(100).default(5),
        stock: zod_1.z.number().int().min(0, 'Stock cannot be negative'),
        image: zod_1.z.string().url().optional(),
        category: zod_1.z.string().min(2),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(120).optional(),
        sku: zod_1.z.string().min(3).max(30).optional(),
        barcode: zod_1.z.string().min(4).max(30).optional(),
        price: zod_1.z.number().min(0).optional(),
        taxPercent: zod_1.z.number().min(0).max(100).optional(),
        stock: zod_1.z.number().int().min(0).optional(),
        image: zod_1.z.string().url().optional(),
        category: zod_1.z.string().min(2).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.barcodeParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        code: zod_1.z.string().min(1, 'Barcode code is required'),
    }),
});

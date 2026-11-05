import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    sku: z.string().min(3).max(30),
    barcode: z.string().min(4).max(30),
    price: z.number().min(0, 'Price must be positive'),
    taxPercent: z.number().min(0).max(100).default(5),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    image: z.string().url().optional(),
    category: z.string().min(2),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    sku: z.string().min(3).max(30).optional(),
    barcode: z.string().min(4).max(30).optional(),
    price: z.number().min(0).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    image: z.string().url().optional(),
    category: z.string().min(2).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const barcodeParamSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'Barcode code is required'),
  }),
});

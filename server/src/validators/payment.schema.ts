import { z } from 'zod';

export const createOrderPaymentSchema = z.object({
  body: z.object({}).optional(),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
  }),
});

export const verifyExitSchema = z.object({
  body: z.object({
    receiptToken: z.string().min(1, 'Receipt token is required'),
  }),
});

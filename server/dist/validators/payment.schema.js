"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExitSchema = exports.verifyPaymentSchema = exports.createOrderPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createOrderPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
});
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        razorpayOrderId: zod_1.z.string().min(1, 'Razorpay Order ID is required'),
        razorpayPaymentId: zod_1.z.string().min(1, 'Razorpay Payment ID is required'),
        razorpaySignature: zod_1.z.string().min(1, 'Razorpay Signature is required'),
    }),
});
exports.verifyExitSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiptToken: zod_1.z.string().min(1, 'Receipt token is required'),
    }),
});

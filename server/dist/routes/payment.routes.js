"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const payment_schema_1 = require("../validators/payment.schema");
const router = (0, express_1.Router)();
// Webhook route does not use authenticate (Razorpay server calls it)
router.post('/webhook', payment_controller_1.handleRazorpayWebhook);
// Customer payment routes
router.use(auth_1.authenticate);
router.post('/create-order', rateLimiter_1.paymentLimiter, payment_controller_1.createPaymentOrder);
router.post('/verify', rateLimiter_1.paymentLimiter, (0, validate_1.validate)(payment_schema_1.verifyPaymentSchema), payment_controller_1.verifyPayment);
exports.default = router;

import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paymentLimiter } from '../middleware/rateLimiter';
import { verifyPaymentSchema } from '../validators/payment.schema';

const router = Router();

// Webhook route does not use authenticate (Razorpay server calls it)
router.post('/webhook', handleRazorpayWebhook);

// Customer payment routes
router.use(authenticate);
router.post('/create-order', paymentLimiter, createPaymentOrder);
router.post('/verify', paymentLimiter, validate(verifyPaymentSchema), verifyPayment);

export default router;

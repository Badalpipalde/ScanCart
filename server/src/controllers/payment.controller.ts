import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Product, IProduct } from '../models/Product';
import { Order, IOrderItem } from '../models/Order';
import { PaymentService } from '../services/payment.service';
import { ReceiptService } from '../services/receipt.service';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/response';
import { calculateOrderPricing } from '../utils/calculatePricing';
import { env } from '../config/env';

export const createPaymentOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your shopping cart is empty.');
    }

    // 2. Validate all products and stock strictly from DB
    const pricingItems: Array<{ price: number; taxPercent: number; qty: number }> = [];
    const itemSnapshots: IOrderItem[] = [];

    for (const item of cart.items) {
      const prod = item.product as IProduct;
      if (!prod || !prod.isActive) {
        throw ApiError.badRequest('One or more items in your cart is no longer available.');
      }

      if (prod.stock < item.qty) {
        throw ApiError.badRequest(
          `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`
        );
      }

      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty,
      });

      itemSnapshots.push({
        productId: prod._id as any,
        name: prod.name,
        sku: prod.sku,
        qty: item.qty,
        unitPrice: prod.price,
        taxPercent: prod.taxPercent,
      });
    }

    // 3. Compute accurate pricing
    const pricing = calculateOrderPricing(pricingItems);
    if (pricing.total <= 0) {
      throw ApiError.badRequest('Order total must be greater than zero.');
    }

    // 4. Create Razorpay order
    const receiptId = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`;
    const razorpayOrder = await PaymentService.createOrder({
      amountInRupees: pricing.total,
      receiptId,
      notes: {
        userId: userId.toString(),
        userEmail: req.user!.email,
      },
    });

    sendSuccess(res, {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
      pricing,
      items: itemSnapshots,
    }, 'Payment order initiated');
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // 1. Idempotency Check: check if order already exists
    const existingOrder = await Order.findOne({
      'payment.razorpayOrderId': razorpayOrderId,
    });

    if (existingOrder) {
      if (existingOrder.payment.status === 'paid') {
        sendSuccess(
          res,
          { order: existingOrder, receiptToken: existingOrder.receiptToken },
          'Payment already verified (idempotent)',
          200
        );
        return;
      }
    }

    // 2. Cryptographic signature check
    const isValidSignature = PaymentService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      throw ApiError.badRequest('Invalid payment signature. Verification failed.');
    }

    // 3. Re-fetch cart & re-verify stock before locking order
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty or already checked out.');
    }

    const pricingItems: Array<{ price: number; taxPercent: number; qty: number }> = [];
    const itemSnapshots: IOrderItem[] = [];

    for (const item of cart.items) {
      const prod = item.product as IProduct;
      if (!prod || !prod.isActive) {
        throw ApiError.badRequest(`Product unavailable: ${item.product}`);
      }

      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty,
      });

      itemSnapshots.push({
        productId: prod._id as any,
        name: prod.name,
        sku: prod.sku,
        qty: item.qty,
        unitPrice: prod.price,
        taxPercent: prod.taxPercent,
      });
    }

    const pricing = calculateOrderPricing(pricingItems);

    // 4. Atomically decrement inventory
    for (const item of itemSnapshots) {
      const updateResult = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );

      if (!updateResult) {
        throw ApiError.badRequest(
          `Stock depletion error: Not enough stock remaining for ${item.name}.`
        );
      }
    }

    // 5. Generate unique Order ID & Cryptographic Receipt
    const orderCreatedAt = new Date();
    const tempOrderId = new (require('mongoose').Types.ObjectId)();

    const receiptPayload = {
      orderId: tempOrderId.toString(),
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total,
      itemCount: pricing.itemCount,
      items: itemSnapshots.map((it) => ({
        name: it.name,
        sku: it.sku,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
      createdAt: orderCreatedAt.toISOString(),
    };

    const receiptToken = ReceiptService.createReceiptToken(receiptPayload);

    // 6. Persist Order
    const newOrder = await Order.create({
      _id: tempOrderId,
      user: userId,
      items: itemSnapshots,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total,
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      receiptToken,
      exitStatus: 'pending',
      createdAt: orderCreatedAt,
    });

    // 7. Clear user cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    sendSuccess(
      res,
      {
        order: newOrder,
        receiptToken,
      },
      'Payment verified and order created successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const handleRazorpayWebhook = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      res.status(400).json({ status: 'invalid signature' });
      return;
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const order = await Order.findOne({ 'payment.razorpayOrderId': orderId });
        if (order && order.payment.status !== 'paid') {
          order.payment.status = 'paid';
          order.payment.razorpayPaymentId = paymentEntity.id;
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

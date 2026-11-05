"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRazorpayWebhook = exports.verifyPayment = exports.createPaymentOrder = void 0;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const payment_service_1 = require("../services/payment.service");
const receipt_service_1 = require("../services/receipt.service");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const calculatePricing_1 = require("../utils/calculatePricing");
const env_1 = require("../config/env");
const createPaymentOrder = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // 1. Fetch user's cart
        const cart = await Cart_1.Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            throw apiError_1.ApiError.badRequest('Your shopping cart is empty.');
        }
        // 2. Validate all products and stock strictly from DB
        const pricingItems = [];
        const itemSnapshots = [];
        for (const item of cart.items) {
            const prod = item.product;
            if (!prod || !prod.isActive) {
                throw apiError_1.ApiError.badRequest('One or more items in your cart is no longer available.');
            }
            if (prod.stock < item.qty) {
                throw apiError_1.ApiError.badRequest(`Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`);
            }
            pricingItems.push({
                price: prod.price,
                taxPercent: prod.taxPercent,
                qty: item.qty,
            });
            itemSnapshots.push({
                productId: prod._id,
                name: prod.name,
                sku: prod.sku,
                qty: item.qty,
                unitPrice: prod.price,
                taxPercent: prod.taxPercent,
            });
        }
        // 3. Compute accurate pricing
        const pricing = (0, calculatePricing_1.calculateOrderPricing)(pricingItems);
        if (pricing.total <= 0) {
            throw apiError_1.ApiError.badRequest('Order total must be greater than zero.');
        }
        // 4. Create Razorpay order
        const receiptId = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`;
        const razorpayOrder = await payment_service_1.PaymentService.createOrder({
            amountInRupees: pricing.total,
            receiptId,
            notes: {
                userId: userId.toString(),
                userEmail: req.user.email,
            },
        });
        (0, response_1.sendSuccess)(res, {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount, // in paise
            currency: razorpayOrder.currency,
            keyId: env_1.env.RAZORPAY_KEY_ID,
            pricing,
            items: itemSnapshots,
        }, 'Payment order initiated');
    }
    catch (err) {
        next(err);
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        // 1. Idempotency Check: check if order already exists
        const existingOrder = await Order_1.Order.findOne({
            'payment.razorpayOrderId': razorpayOrderId,
        });
        if (existingOrder) {
            if (existingOrder.payment.status === 'paid') {
                (0, response_1.sendSuccess)(res, { order: existingOrder, receiptToken: existingOrder.receiptToken }, 'Payment already verified (idempotent)', 200);
                return;
            }
        }
        // 2. Cryptographic signature check
        const isValidSignature = payment_service_1.PaymentService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValidSignature) {
            throw apiError_1.ApiError.badRequest('Invalid payment signature. Verification failed.');
        }
        // 3. Re-fetch cart & re-verify stock before locking order
        const cart = await Cart_1.Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            throw apiError_1.ApiError.badRequest('Cart is empty or already checked out.');
        }
        const pricingItems = [];
        const itemSnapshots = [];
        for (const item of cart.items) {
            const prod = item.product;
            if (!prod || !prod.isActive) {
                throw apiError_1.ApiError.badRequest(`Product unavailable: ${item.product}`);
            }
            pricingItems.push({
                price: prod.price,
                taxPercent: prod.taxPercent,
                qty: item.qty,
            });
            itemSnapshots.push({
                productId: prod._id,
                name: prod.name,
                sku: prod.sku,
                qty: item.qty,
                unitPrice: prod.price,
                taxPercent: prod.taxPercent,
            });
        }
        const pricing = (0, calculatePricing_1.calculateOrderPricing)(pricingItems);
        // 4. Atomically decrement inventory
        for (const item of itemSnapshots) {
            const updateResult = await Product_1.Product.findOneAndUpdate({ _id: item.productId, stock: { $gte: item.qty } }, { $inc: { stock: -item.qty } }, { new: true });
            if (!updateResult) {
                throw apiError_1.ApiError.badRequest(`Stock depletion error: Not enough stock remaining for ${item.name}.`);
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
        const receiptToken = receipt_service_1.ReceiptService.createReceiptToken(receiptPayload);
        // 6. Persist Order
        const newOrder = await Order_1.Order.create({
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
        await Cart_1.Cart.findOneAndUpdate({ user: userId }, { items: [] });
        (0, response_1.sendSuccess)(res, {
            order: newOrder,
            receiptToken,
        }, 'Payment verified and order created successfully', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.verifyPayment = verifyPayment;
const handleRazorpayWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = JSON.stringify(req.body);
        const isValid = payment_service_1.PaymentService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            res.status(400).json({ status: 'invalid signature' });
            return;
        }
        const event = req.body.event;
        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = req.body.payload?.payment?.entity;
            const orderId = paymentEntity?.order_id;
            if (orderId) {
                const order = await Order_1.Order.findOne({ 'payment.razorpayOrderId': orderId });
                if (order && order.payment.status !== 'paid') {
                    order.payment.status = 'paid';
                    order.payment.razorpayPaymentId = paymentEntity.id;
                    await order.save();
                }
            }
        }
        res.status(200).json({ status: 'ok' });
    }
    catch (err) {
        next(err);
    }
};
exports.handleRazorpayWebhook = handleRazorpayWebhook;

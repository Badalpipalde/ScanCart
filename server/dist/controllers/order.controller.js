"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExit = exports.getOrderById = exports.getMyOrders = void 0;
const Order_1 = require("../models/Order");
const receipt_service_1 = require("../services/receipt.service");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const orders = await Order_1.Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);
        (0, response_1.sendSuccess)(res, { orders, count: orders.length });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order_1.Order.findById(id).populate('user', 'name email');
        if (!order) {
            throw apiError_1.ApiError.notFound('Order not found');
        }
        // Only customer who owns it, or staff/admin can view it
        const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
        const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';
        if (!isOwner && !isStaffOrAdmin) {
            throw apiError_1.ApiError.forbidden('You do not have permission to view this order.');
        }
        (0, response_1.sendSuccess)(res, { order });
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
const verifyExit = async (req, res, next) => {
    try {
        const { receiptToken } = req.body;
        const staffUser = req.user;
        if (!receiptToken) {
            throw apiError_1.ApiError.badRequest('Receipt token is required');
        }
        // 1. Verify cryptographic token signature
        const verification = receipt_service_1.ReceiptService.verifyReceiptToken(receiptToken);
        if (!verification.isValid || !verification.payload) {
            res.status(400).json({
                success: false,
                status: 'INVALID_SIGNATURE',
                message: 'Security Alert: QR signature verification failed. Receipt might be tampered.',
                error: verification.error,
            });
            return;
        }
        const { orderId } = verification.payload;
        // 2. Fetch order from DB
        const order = await Order_1.Order.findById(orderId).populate('user', 'name email');
        if (!order) {
            res.status(404).json({
                success: false,
                status: 'ORDER_NOT_FOUND',
                message: 'No corresponding order found in store database.',
            });
            return;
        }
        // 3. Ensure payment was actually completed
        if (order.payment.status !== 'paid') {
            res.status(400).json({
                success: false,
                status: 'UNPAID_ORDER',
                message: 'Order has not been marked as paid.',
            });
            return;
        }
        // 4. Reject duplicate verification (single-exit enforcement)
        if (order.exitStatus === 'verified') {
            const populatedOrder = await Order_1.Order.findById(orderId)
                .populate('user', 'name email')
                .populate('verifiedBy', 'name email');
            res.status(409).json({
                success: false,
                status: 'ALREADY_VERIFIED',
                message: 'Warning: This QR receipt has already been verified and used for exit.',
                data: {
                    order: populatedOrder,
                    previouslyVerifiedAt: order.verifiedAt,
                    previouslyVerifiedBy: populatedOrder?.verifiedBy?.name || 'Unknown Staff',
                },
            });
            return;
        }
        // 5. Mark as verified atomically
        order.exitStatus = 'verified';
        order.verifiedBy = staffUser._id;
        order.verifiedAt = new Date();
        await order.save();
        const verifiedOrder = await Order_1.Order.findById(orderId)
            .populate('user', 'name email')
            .populate('verifiedBy', 'name email');
        (0, response_1.sendSuccess)(res, {
            status: 'VERIFIED_SUCCESSFULLY',
            order: verifiedOrder,
            verifiedAt: order.verifiedAt,
            verifiedBy: staffUser.name,
        }, 'Exit cleared successfully. Customer verified to leave.', 200);
    }
    catch (err) {
        next(err);
    }
};
exports.verifyExit = verifyExit;

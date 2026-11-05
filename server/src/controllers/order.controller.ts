import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { ReceiptService } from '../services/receipt.service';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/response';

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccess(res, { orders, count: orders.length });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Only customer who owns it, or staff/admin can view it
    const isOwner = order.user && (order.user as any)._id.toString() === req.user!._id.toString();
    const isStaffOrAdmin = req.user!.role === 'staff' || req.user!.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      throw ApiError.forbidden('You do not have permission to view this order.');
    }

    sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
};

export const verifyExit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { receiptToken } = req.body;
    const staffUser = req.user!;

    if (!receiptToken) {
      throw ApiError.badRequest('Receipt token is required');
    }

    // 1. Verify cryptographic token signature
    const verification = ReceiptService.verifyReceiptToken(receiptToken);
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
    const order = await Order.findById(orderId).populate('user', 'name email');
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
      const populatedOrder = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('verifiedBy', 'name email');

      res.status(409).json({
        success: false,
        status: 'ALREADY_VERIFIED',
        message: 'Warning: This QR receipt has already been verified and used for exit.',
        data: {
          order: populatedOrder,
          previouslyVerifiedAt: order.verifiedAt,
          previouslyVerifiedBy: (populatedOrder?.verifiedBy as any)?.name || 'Unknown Staff',
        },
      });
      return;
    }

    // 5. Mark as verified atomically
    order.exitStatus = 'verified';
    order.verifiedBy = staffUser._id as any;
    order.verifiedAt = new Date();
    await order.save();

    const verifiedOrder = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    sendSuccess(
      res,
      {
        status: 'VERIFIED_SUCCESSFULLY',
        order: verifiedOrder,
        verifiedAt: order.verifiedAt,
        verifiedBy: staffUser.name,
      },
      'Exit cleared successfully. Customer verified to leave.',
      200
    );
  } catch (err) {
    next(err);
  }
};

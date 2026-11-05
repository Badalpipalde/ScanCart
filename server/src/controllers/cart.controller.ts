import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Product, IProduct } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/response';
import { calculateOrderPricing } from '../utils/calculatePricing';

/**
 * Helper to compute live totals for a populated cart
 */
const formatCartResponse = (cart: any) => {
  const formattedItems: any[] = [];
  const pricingItems: any[] = [];

  for (const item of cart.items || []) {
    const prod = item.product as IProduct;
    if (prod && prod.isActive) {
      formattedItems.push({
        product: {
          id: prod._id,
          name: prod.name,
          sku: prod.sku,
          barcode: prod.barcode,
          price: prod.price,
          taxPercent: prod.taxPercent,
          stock: prod.stock,
          image: prod.image,
          category: prod.category,
        },
        qty: item.qty,
        itemSubtotal: Math.round(prod.price * item.qty * 100) / 100,
      });

      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty,
      });
    }
  }

  const totals = calculateOrderPricing(pricingItems);

  return {
    id: cart._id,
    items: formattedItems,
    ...totals,
    updatedAt: cart.updatedAt,
  };
};

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    sendSuccess(res, { cart: formatCartResponse(cart) });
  } catch (err) {
    next(err);
  }
};

export const addItemToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, qty = 1 } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw ApiError.notFound('Product not found or inactive');
    }

    if (product.stock < qty) {
      throw ApiError.badRequest(
        `Insufficient stock for "${product.name}". Available stock: ${product.stock}`
      );
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].qty + qty;
      if (product.stock < newQty) {
        throw ApiError.badRequest(
          `Cannot add more "${product.name}". Max available stock is ${product.stock}.`
        );
      }
      cart.items[existingIndex].qty = newQty;
    } else {
      cart.items.push({ product: product._id, qty });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    sendSuccess(res, { cart: formatCartResponse(populated) }, 'Item added to cart');
  } catch (err) {
    next(err);
  }
};

export const updateCartItemQty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;
    const { qty } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    if (qty <= 0) {
      // Remove item if qty is 0
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId.toString()
      );
    } else {
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product) {
        throw ApiError.notFound('Product not found');
      }

      if (product.stock < qty) {
        throw ApiError.badRequest(
          `Only ${product.stock} units available in stock for "${product.name}".`
        );
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].qty = qty;
      } else {
        cart.items.push({ product: product._id, qty });
      }
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    sendSuccess(res, { cart: formatCartResponse(populated) }, 'Cart updated');
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    sendSuccess(res, { cart: formatCartResponse(populated) }, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
    sendSuccess(res, { cart: { items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 } }, 'Cart cleared');
  } catch (err) {
    next(err);
  }
};

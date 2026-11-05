"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItemQty = exports.addItemToCart = exports.getCart = void 0;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const calculatePricing_1 = require("../utils/calculatePricing");
/**
 * Helper to compute live totals for a populated cart
 */
const formatCartResponse = (cart) => {
    const formattedItems = [];
    const pricingItems = [];
    for (const item of cart.items || []) {
        const prod = item.product;
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
    const totals = (0, calculatePricing_1.calculateOrderPricing)(pricingItems);
    return {
        id: cart._id,
        items: formattedItems,
        ...totals,
        updatedAt: cart.updatedAt,
    };
};
const getCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let cart = await Cart_1.Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = await Cart_1.Cart.create({ user: userId, items: [] });
        }
        (0, response_1.sendSuccess)(res, { cart: formatCartResponse(cart) });
    }
    catch (err) {
        next(err);
    }
};
exports.getCart = getCart;
const addItemToCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, qty = 1 } = req.body;
        const product = await Product_1.Product.findOne({ _id: productId, isActive: true });
        if (!product) {
            throw apiError_1.ApiError.notFound('Product not found or inactive');
        }
        if (product.stock < qty) {
            throw apiError_1.ApiError.badRequest(`Insufficient stock for "${product.name}". Available stock: ${product.stock}`);
        }
        let cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_1.Cart({ user: userId, items: [] });
        }
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());
        if (existingIndex > -1) {
            const newQty = cart.items[existingIndex].qty + qty;
            if (product.stock < newQty) {
                throw apiError_1.ApiError.badRequest(`Cannot add more "${product.name}". Max available stock is ${product.stock}.`);
            }
            cart.items[existingIndex].qty = newQty;
        }
        else {
            cart.items.push({ product: product._id, qty });
        }
        await cart.save();
        const populated = await Cart_1.Cart.findById(cart._id).populate('items.product');
        (0, response_1.sendSuccess)(res, { cart: formatCartResponse(populated) }, 'Item added to cart');
    }
    catch (err) {
        next(err);
    }
};
exports.addItemToCart = addItemToCart;
const updateCartItemQty = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { qty } = req.body;
        let cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            throw apiError_1.ApiError.notFound('Cart not found');
        }
        if (qty <= 0) {
            // Remove item if qty is 0
            cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
        }
        else {
            const product = await Product_1.Product.findOne({ _id: productId, isActive: true });
            if (!product) {
                throw apiError_1.ApiError.notFound('Product not found');
            }
            if (product.stock < qty) {
                throw apiError_1.ApiError.badRequest(`Only ${product.stock} units available in stock for "${product.name}".`);
            }
            const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());
            if (itemIndex > -1) {
                cart.items[itemIndex].qty = qty;
            }
            else {
                cart.items.push({ product: product._id, qty });
            }
        }
        await cart.save();
        const populated = await Cart_1.Cart.findById(cart._id).populate('items.product');
        (0, response_1.sendSuccess)(res, { cart: formatCartResponse(populated) }, 'Cart updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateCartItemQty = updateCartItemQty;
const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            throw apiError_1.ApiError.notFound('Cart not found');
        }
        cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
        await cart.save();
        const populated = await Cart_1.Cart.findById(cart._id).populate('items.product');
        (0, response_1.sendSuccess)(res, { cart: formatCartResponse(populated) }, 'Item removed from cart');
    }
    catch (err) {
        next(err);
    }
};
exports.removeCartItem = removeCartItem;
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await Cart_1.Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
        (0, response_1.sendSuccess)(res, { cart: { items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 } }, 'Cart cleared');
    }
    catch (err) {
        next(err);
    }
};
exports.clearCart = clearCart;

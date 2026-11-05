"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const cart_schema_1 = require("../validators/cart.schema");
const router = (0, express_1.Router)();
// All cart operations require customer authentication
router.use(auth_1.authenticate);
router.get('/', cart_controller_1.getCart);
router.post('/items', (0, validate_1.validate)(cart_schema_1.addCartItemSchema), cart_controller_1.addItemToCart);
router.patch('/items/:productId', (0, validate_1.validate)(cart_schema_1.updateCartItemSchema), cart_controller_1.updateCartItemQty);
router.delete('/items/:productId', (0, validate_1.validate)(cart_schema_1.deleteCartItemSchema), cart_controller_1.removeCartItem);
router.delete('/', cart_controller_1.clearCart);
exports.default = router;

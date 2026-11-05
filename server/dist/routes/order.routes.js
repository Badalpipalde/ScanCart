"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const payment_schema_1 = require("../validators/payment.schema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Customer & authorized orders
router.get('/', order_controller_1.getMyOrders);
router.get('/:id', order_controller_1.getOrderById);
// Staff exit verification gate
router.post('/verify-exit', (0, role_1.authorize)('staff', 'admin'), (0, validate_1.validate)(payment_schema_1.verifyExitSchema), order_controller_1.verifyExit);
exports.default = router;

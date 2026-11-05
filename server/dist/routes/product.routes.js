"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const validate_1 = require("../middleware/validate");
const product_schema_1 = require("../validators/product.schema");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
// Public / Authenticated read routes
router.get('/barcode/:code', (0, validate_1.validate)(product_schema_1.barcodeParamSchema), product_controller_1.getProductByBarcode);
router.get('/', product_controller_1.getAllProducts);
router.get('/:id', product_controller_1.getProductById);
// Admin only CRUD
router.post('/', auth_1.authenticate, (0, role_1.authorize)('admin'), (0, validate_1.validate)(product_schema_1.createProductSchema), product_controller_1.createProduct);
router.put('/:id', auth_1.authenticate, (0, role_1.authorize)('admin'), (0, validate_1.validate)(product_schema_1.updateProductSchema), product_controller_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, role_1.authorize)('admin'), product_controller_1.deleteProduct);
exports.default = router;

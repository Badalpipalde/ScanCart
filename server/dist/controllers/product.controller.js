"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = exports.getProductByBarcode = void 0;
const Product_1 = require("../models/Product");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const getProductByBarcode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const trimmedCode = code.trim();
        const product = await Product_1.Product.findOne({
            barcode: trimmedCode,
            isActive: true,
        });
        if (!product) {
            throw apiError_1.ApiError.notFound(`No active product found for barcode: ${trimmedCode}`);
        }
        (0, response_1.sendSuccess)(res, { product }, 'Product found successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.getProductByBarcode = getProductByBarcode;
const getAllProducts = async (req, res, next) => {
    try {
        const { category, search, activeOnly } = req.query;
        const filter = {};
        if (activeOnly !== 'false') {
            filter.isActive = true;
        }
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }
        const products = await Product_1.Product.find(filter).sort({ category: 1, name: 1 });
        (0, response_1.sendSuccess)(res, { products, count: products.length }, 'Products retrieved');
    }
    catch (err) {
        next(err);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            throw apiError_1.ApiError.notFound('Product not found');
        }
        (0, response_1.sendSuccess)(res, { product });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.create(req.body);
        (0, response_1.sendSuccess)(res, { product }, 'Product created successfully', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            throw apiError_1.ApiError.notFound('Product not found');
        }
        (0, response_1.sendSuccess)(res, { product }, 'Product updated successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) {
            throw apiError_1.ApiError.notFound('Product not found');
        }
        (0, response_1.sendSuccess)(res, null, 'Product deactivated successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;

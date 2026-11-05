"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const env_1 = require("../config/env");
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];
    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate entry: A record with this ${field} already exists.`;
    }
    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ID format for: ${err.path}`;
    }
    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error occurred';
        errors = Object.values(err.errors).map((e) => ({
            path: e.path,
            message: e.message,
        }));
    }
    if (statusCode === 500 && env_1.env.NODE_ENV !== 'test') {
        console.error('💥 Unhandled Exception:', err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;

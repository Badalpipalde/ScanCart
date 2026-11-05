"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
    });
};
exports.sendError = sendError;

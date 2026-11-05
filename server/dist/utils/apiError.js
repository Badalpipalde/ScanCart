"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errors;
    isOperational;
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(msg, errors = []) {
        return new ApiError(400, msg, errors);
    }
    static unauthorized(msg = 'Unauthorized access') {
        return new ApiError(401, msg);
    }
    static forbidden(msg = 'Forbidden') {
        return new ApiError(403, msg);
    }
    static notFound(msg = 'Resource not found') {
        return new ApiError(404, msg);
    }
    static conflict(msg) {
        return new ApiError(409, msg);
    }
    static internal(msg = 'Internal server error') {
        return new ApiError(500, msg);
    }
}
exports.ApiError = ApiError;

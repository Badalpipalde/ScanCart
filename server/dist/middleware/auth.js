"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const apiError_1 = require("../utils/apiError");
const authenticate = async (req, _res, next) => {
    try {
        let token;
        // 1. Check cookies first (httpOnly)
        if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
            token = req.cookies.token || req.cookies.jwt;
        }
        // 2. Check Authorization Bearer header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw apiError_1.ApiError.unauthorized('Authentication required. Please log in.');
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            throw apiError_1.ApiError.unauthorized('User associated with this token no longer exists.');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(apiError_1.ApiError.unauthorized('Invalid or expired authentication token.'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;

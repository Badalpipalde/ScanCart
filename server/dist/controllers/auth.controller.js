"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: '7d' });
};
const sendTokenResponse = (res, user, statusCode = 200, message = 'Success') => {
    const token = generateToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return (0, response_1.sendSuccess)(res, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    }, message, statusCode);
};
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw apiError_1.ApiError.conflict('An account with this email address already exists.');
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: role || 'customer',
        });
        sendTokenResponse(res, newUser, 201, 'User account created successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password.');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password.');
        }
        sendTokenResponse(res, user, 200, 'Logged in successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const logout = async (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw apiError_1.ApiError.unauthorized('Not authenticated');
        }
        (0, response_1.sendSuccess)(res, {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                createdAt: req.user.createdAt,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;

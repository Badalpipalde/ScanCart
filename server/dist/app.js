"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDbConnected = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const Product_1 = require("./models/Product");
const seedProducts_1 = require("./seeds/seedProducts");
exports.app = (0, express_1.default)();
// Security HTTP headers
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration for client
const allowedOrigins = [env_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like same-origin, curl, mobile apps)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) ||
            process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Cookie and request body parsing
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json({ limit: '2mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// Logging
if (env_1.env.NODE_ENV !== 'test') {
    exports.app.use((0, morgan_1.default)('dev'));
}
// Global API rate limit
exports.app.use('/api', rateLimiter_1.apiLimiter);
// Health check
exports.app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ScanCart API',
    });
});
// Mount versioned API routes
exports.app.use('/api/v1', routes_1.default);
// 404 handler for unknown routes
exports.app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    });
});
// Centralized error handling
exports.app.use(errorHandler_1.errorHandler);
// DB initialization for serverless / Vercel execution
let dbInitPromise = null;
const ensureDbConnected = async () => {
    if (!dbInitPromise) {
        dbInitPromise = (async () => {
            await (0, db_1.connectDB)();
            try {
                const productCount = await Product_1.Product.countDocuments();
                if (productCount === 0) {
                    console.log('📦 Database has 0 products. Auto-seeding mock catalog and test users...');
                    await (0, seedProducts_1.seedDatabase)(false);
                }
            }
            catch (seedErr) {
                console.warn('⚠️ Seeding check skipped:', seedErr);
            }
        })();
    }
    return dbInitPromise;
};
exports.ensureDbConnected = ensureDbConnected;
// Ensure DB is initialized before processing requests in serverless / Vercel environment
exports.app.use(async (_req, _res, next) => {
    try {
        await (0, exports.ensureDbConnected)();
        next();
    }
    catch (error) {
        next(error);
    }
});
// Start server for traditional Node.js environments (local dev / standalone)
const startServer = async () => {
    try {
        await (0, exports.ensureDbConnected)();
        const server = exports.app.listen(env_1.env.PORT, () => {
            console.log(`🛒 ScanCart API Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            console.log(`🔗 Health check available at: http://localhost:${env_1.env.PORT}/api/health`);
        });
        return server;
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    startServer();
}
exports.default = exports.app;

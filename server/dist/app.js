"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
// Security HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration for client
const allowedOrigins = [env_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use((0, cors_1.default)({
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
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// Logging
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Global API rate limit
app.use('/api', rateLimiter_1.apiLimiter);
// DB initialization for serverless / Vercel execution
let dbInitPromise = null;
const ensureDbConnected = async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        return;
    }
    if (!dbInitPromise) {
        dbInitPromise = (0, db_1.connectDB)().catch((err) => {
            dbInitPromise = null; // Allow retry on subsequent request
            throw err;
        });
    }
    return dbInitPromise;
};
// Root API endpoint
app.get(['/api', '/'], (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'ScanCart API',
        health: '/api/health',
    });
});
// Health check (always responds with 200 and reports live database state)
app.get(['/api/health', '/health'], (_req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const dbStatus = dbStates[mongoose_1.default.connection.readyState] || 'unknown';
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ScanCart API',
        database: dbStatus,
    });
});
// Ensure DB is initialized before processing API routes
app.use(['/api/v1', '/v1'], async (_req, _res, next) => {
    try {
        await ensureDbConnected();
        next();
    }
    catch (error) {
        next(error);
    }
});
// Mount versioned API routes
app.use(['/api/v1', '/v1'], routes_1.default);
// 404 handler for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    });
});
// Centralized error handling
app.use(errorHandler_1.errorHandler);
// Start server for traditional Node.js environments (local dev / standalone)
const startServer = async () => {
    try {
        await ensureDbConnected();
        const server = app.listen(env_1.env.PORT, () => {
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
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
    startServer();
}
// Ensure app can be consumed as callable function or default export
app.default = app;
module.exports = app;

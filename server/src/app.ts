import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { Product } from './models/Product';
import { seedDatabase } from './seeds/seedProducts';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for client
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like same-origin, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Cookie and request body parsing
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limit
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ScanCart API',
  });
});

// Mount versioned API routes
app.use('/api/v1', routes);

// 404 handler for unknown routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
});

// Centralized error handling
app.use(errorHandler);

// DB initialization for serverless / Vercel execution
let dbInitPromise: Promise<void> | null = null;

export const ensureDbConnected = async (): Promise<void> => {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
          console.log('📦 Database has 0 products. Auto-seeding mock catalog and test users...');
          await seedDatabase(false);
        }
      } catch (seedErr) {
        console.warn('⚠️ Seeding check skipped:', seedErr);
      }
    })();
  }
  return dbInitPromise;
};

// Ensure DB is initialized before processing requests in serverless / Vercel environment
app.use(async (_req: Request, _res: Response, next) => {
  try {
    await ensureDbConnected();
    next();
  } catch (error) {
    next(error);
  }
});

// Start server for traditional Node.js environments (local dev / standalone)
const startServer = async () => {
  try {
    await ensureDbConnected();

    const server = app.listen(env.PORT, () => {
      console.log(`🛒 ScanCart API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`🔗 Health check available at: http://localhost:${env.PORT}/api/health`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;

import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

// Only set custom DNS servers in local development environments where system DNS might fail SRV lookups.
// In cloud / serverless environments (Vercel / AWS Lambda), NEVER override default resolvers as outbound port 53 is blocked.
if (
  process.env.NODE_ENV !== 'production' &&
  !process.env.VERCEL &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME
) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore in restricted environments
  }
}

let mongodInstance: any = null;
let connectionPromise: Promise<void> | null = null;

export async function connectDB(): Promise<void> {
  // If already connected, reuse existing connection (crucial for serverless warm invocations)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If a connection attempt is in flight, reuse the promise
  if (connectionPromise) {
    return connectionPromise;
  }

  const primaryUri = env.MONGODB_URI;

  connectionPromise = (async () => {
    try {
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to MongoDB at: ${primaryUri.split('@').pop()}`);
    } catch (err: any) {
      console.error(`⚠️ Could not connect to primary MongoDB (${err.message}).`);

      const isProductionOrServerless =
        process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

      if (isProductionOrServerless) {
        throw new Error(
          `Failed to connect to MongoDB Atlas (${err.message}). Please verify: 1) MONGODB_URI is set correctly in Vercel environment variables, and 2) Network Access in MongoDB Atlas allows 0.0.0.0/0 (anywhere).`
        );
      }

      console.log(`🚀 Starting in-memory MongoDB fallback server for local development...`);

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const inMemoryUri = mongodInstance.getUri();
        await mongoose.connect(inMemoryUri);
        console.log(`✅ Connected to in-memory MongoDB at: ${inMemoryUri}`);
      } catch (inMemErr: any) {
        console.error('❌ Failed to start in-memory MongoDB:', inMemErr.message);
        throw inMemErr;
      }
    }
  })().catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  connectionPromise = null;
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

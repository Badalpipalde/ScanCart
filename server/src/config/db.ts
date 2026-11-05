import mongoose from 'mongoose';
import { env } from './env';

let mongodInstance: any = null;

export async function connectDB(): Promise<void> {
  const primaryUri = env.MONGODB_URI;

  try {
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ Connected to MongoDB at: ${primaryUri.split('@').pop()}`);
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}).`);
    console.log(`🚀 Starting in-memory MongoDB fallback server...`);

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

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

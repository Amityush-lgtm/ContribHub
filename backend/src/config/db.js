import mongoose from 'mongoose';

let memoryServer = null;

// Cache connection promise across serverless lambdas / invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
    }
  }

  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    const opts = {
      bufferCommands: false, // Prevents 10000ms buffering hang on serverless / disconnected state
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };

    try {
      console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
      cached.promise = mongoose.connect(uri, opts);
      cached.conn = await cached.promise;
      console.log('Connected to MongoDB successfully.');
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.warn('[WARN] Failed to connect to specified MONGODB_URI:', err.message);
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('Falling back to MongoMemoryServer for development...');
    }
  }

  // Fallback to MongoMemoryServer only in non-production local development
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI environment variable is required in production.');
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const inMemoryUri = memoryServer.getUri();
    console.log(`Started In-Memory MongoDB Server at: ${inMemoryUri}`);
    await mongoose.connect(inMemoryUri);
    console.log('Connected to In-Memory MongoDB successfully.');
  } catch (err) {
    console.error('[ERROR] Failed to connect to any MongoDB instance:', err);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};

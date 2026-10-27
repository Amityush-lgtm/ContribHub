import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`Connecting to MongoDB at: ${uri}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('[WARN] Failed to connect to specified MONGODB_URI:', err.message);
      console.log('Falling back to MongoMemoryServer for development...');
    }
  }

  // Fallback to MongoMemoryServer
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

import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Failed to establish database connection in serverless function:', err);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please ensure MONGODB_URI is configured.'
      });
    }
  }

  return app(req, res);
}

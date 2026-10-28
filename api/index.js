import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to establish database connection in serverless function:', err);
    return res.status(503).json({
      success: false,
      message: `Database connection failed (${err.message}). Ensure MongoDB Atlas Network Access allows 0.0.0.0/0 and MONGODB_URI is configured.`
    });
  }

  return app(req, res);
}

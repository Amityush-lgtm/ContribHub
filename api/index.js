import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error in serverless handler',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import contributionRoutes from './routes/contributionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint (always accessible without DB dependency)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ContribHub API',
    phases: 'Phases 1-5 Complete: Foundation, Contributions, Mentor Evaluation, Admin Management, Deployment'
  });
});

// Serverless DB connection middleware: ensure DB connection is ready before handling /api routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in request middleware:', err.message);
    return res.status(503).json({
      success: false,
      message: `Database connection unavailable (${err.message}). Ensure MongoDB Atlas Network Access has 0.0.0.0/0 allowed and MONGODB_URI is set in Vercel.`
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---------- Production: serve React frontend (non-serverless) ----------
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));

  // All non-API routes fall through to the React SPA
  app.get('*', (req, res, next) => {
    // Only serve index.html for non-API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

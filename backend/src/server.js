import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`ContribHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[ERROR] Port ${PORT} is already in use. Please close the process using port ${PORT} or change PORT in .env`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
      });
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();

export default app;

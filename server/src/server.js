import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';
import mongoose from 'mongoose';

/**
 * Server Bootstrap
 * Enforces requirement: Refuse to start if MongoDB connection fails.
 */
const startServer = async () => {
  let server;

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnection:', err);
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }

    // Force shutdown if taking longer than 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Global unhandled promise rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection encountered:', reason);
  });

  // Global uncaught exception handler
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception encountered:', error);
    process.exit(1);
  });

  try {
    logger.info('Initializing AI Chat Assistant backend...');

    // 1. Establish database connection first
    await connectDB();
    logger.info('Database connection established successfully.');

    // 2. Start Express HTTP Server only after DB is connected
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`👉 Health check available at: http://localhost:${env.PORT}/api/health`);
    });

    // Handle unexpected server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use. Please select a different port.`);
      } else {
        logger.error('Server encountered an error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    // Refuse to start with a clear error if MongoDB connection fails.
    console.error('\n' + '='.repeat(60));
    console.error('❌ FATAL: BACKEND STARTUP ABORTED!');
    console.error('Reason: Failed to connect to MongoDB.');
    console.error('The backend will NOT start without an active database connection.');
    console.error(`Attempted URI: ${env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
    console.error('Error message:', error.message);
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
};

startServer();

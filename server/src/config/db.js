import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB Atlas
 * Strictly connects to database 'ai_chat_assistant' without any local fallback.
 * Throws error if connection fails so server startup is aborted.
 */
export const connectDB = async () => {
  try {
    const connectionOptions = {
      dbName: 'ai_chat_assistant',
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    logger.info('Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(env.MONGODB_URI, connectionOptions);

    logger.info('MongoDB connected successfully.');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error encountered:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB connection restored.');
    });

    return conn;
  } catch (error) {
    logger.error('FATAL: Failed to connect to MongoDB! Server will not start.', error);
    throw error;
  }
};

/**
 * Get MongoDB connection status ('connected' | 'disconnected')
 */
export const getDatabaseStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};

export default connectDB;

import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const connectionOptions = {
      dbName: env.MONGODB_DB,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    logger.info(`Connecting to MongoDB (dbName: ${env.MONGODB_DB})...`);
    const conn = await mongoose.connect(env.MONGODB_URI, connectionOptions);
    logger.info('MongoDB connected successfully.');
    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB! Server will exit.', error);
    process.exit(1);
  }
};

export const getDatabaseStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};

export default connectDB;



import express from 'express';

import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import connectDB from './config/database';
import redisClient from './config/redis';
import messageRoutes from './routes/messages';

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/messages', messageRoutes);

// Email processing API check
app.get('/', (req, res) => {
  res.send('Email Processing API is running');
});

// Initialize MongoDB and Redis connections
const initializeServices = async () => {
  await connectDB();

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log('Redis client ready');
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
};


initializeServices();

export default app;

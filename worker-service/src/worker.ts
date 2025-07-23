import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define Message model (redeclare it here or move to a shared folder)
const messageSchema = new mongoose.Schema({
  email: String,
  message: String,
  status: String,
  processedAt: Date
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

// Mongo & Redis config
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/email_processing';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Worker connected to MongoDB'))
  .catch(err => {
    console.error('Worker MongoDB connection error:', err);
    process.exit(1);
  });

// Create the BullMQ Worker
const emailWorker = new Worker('email-processing', async (job) => {
  const { messageId } = job.data;

  const message = await Message.findById(messageId);
  if (!message) throw new Error(`Message not found: ${messageId}`);

  console.log(`Sending message to ${message.email}: ${message.message}`);

  // Simulate processing delay
  await new Promise(res => setTimeout(res, 1000));

  message.status = 'completed';
  message.processedAt = new Date();
  await message.save();
}, {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
});

emailWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

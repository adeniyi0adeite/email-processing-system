import { Queue } from 'bullmq';
// import redisClient from '../config/redis';

const emailQueue = new Queue('email-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});


export const addEmailJob = async (messageId: string) => {
  try {
    const job = await emailQueue.add('process-email', {
      messageId,
      timestamp: new Date().toISOString()
    });

    console.log(`Job added to queue: ${job.id} for message: ${messageId}`);
    return job;
  } catch (error: unknown) {
    console.error('Error adding job to queue:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to add job to queue: ${error.message}`);
    } else {
        throw new Error(`Failed to add job to queue: ${String(error)}`);
    }
  }
};


export default emailQueue;
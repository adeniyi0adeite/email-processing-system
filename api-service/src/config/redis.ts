import { createClient } from 'redis';

const redisClient = createClient({
  // Use 'url' property to specify the full Redis connection string
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error', err);
});

// connect the client
(async () => {
    await redisClient.connect();
})();

export default redisClient;
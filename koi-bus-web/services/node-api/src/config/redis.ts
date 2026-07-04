import { createClient } from 'redis';

// Note: Ensure REDIS_URL is in your .env, e.g. redis://localhost:16379
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:16379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect automatically
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis at 16379');
  } catch (error) {
    console.error('Could not connect to Redis:', error);
  }
})();


import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  const port = parseInt(process.env.PORT, 10) || 3001;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL environment variable is required');
  }
  if (!process.env.REDIS_HOST) {
    console.warn('REDIS_HOST not set, defaulting to localhost');
  }
  if (!process.env.REDIS_PORT) {
    console.warn('REDIS_PORT not set, defaulting to 6379');
  }

  return {
    port,
    frontendUrl: process.env.FRONTEND_URL,
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '60m',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    superAdmin: {
        password: process.env.SUPER_ADMIN_PASSWORD || 'password123',
    }
  };
});

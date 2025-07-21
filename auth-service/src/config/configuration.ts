import { ENV } from './constants';

export default () => ({
  [ENV.JWT_SECRET]: process.env.JWT_SECRET || '',
  [ENV.JWT_ACCESS_TOKEN_EXPIRES_IN]:
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  [ENV.JWT_REFRESH_TOKEN_EXPIRES_IN]:
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  [ENV.DATABASE_URL]: process.env.DATABASE_URL || '',
  [ENV.PORT]: parseInt(process.env.PORT || '3000', 10),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

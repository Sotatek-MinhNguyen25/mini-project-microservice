import * as dotenv from 'dotenv';

dotenv.config();

const configuration = () => ({
  port: parseInt(process.env.PORT || '8000'),
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    clientId: process.env.KAFKA_CLIENT_ID || 'api-gateway',
    groupId: process.env.KAFKA_GROUP_ID || 'api-gateway-group',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'my_secret_key',
    accessTokenExpired: process.env.AC_TOKEN_EXPIRED || '15m',
    refreshTokenExpired: process.env.RF_TOKEN_EXPIRED || '30d',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
  },
});

export default configuration;
export const config = configuration();

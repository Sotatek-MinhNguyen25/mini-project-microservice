import * as dotenv from 'dotenv';

dotenv.config();

const configuration = () => ({
  port: parseInt(process.env.PORT || '8000'),
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:29092',
    clientId: process.env.KAFKA_CLIENT_ID || 'api-gateway',
    groupId: process.env.KAFKA_GROUP_ID || 'api-gateway-group',
  },
});

export default configuration;
export const config = configuration();

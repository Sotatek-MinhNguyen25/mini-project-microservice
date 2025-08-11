import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default registerAs('kafka', () => ({
  kafka: {
    brokers: process.env.KAFKA_BROKER,
    clientId: 'mail-service',
    groupId: 'mail-group',
    topic: 'mail-topic',
  },
}));

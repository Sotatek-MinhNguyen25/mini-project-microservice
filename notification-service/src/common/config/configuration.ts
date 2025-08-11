import { Configuration } from './configuration.interface';

export default (): Configuration => ({
  app: {
    port: Number.parseInt(process.env.PORT ?? '8086', 10) || 8086,
  },
  redis: {
    url: process.env.REDIS_URL || 'localhost:6379',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKER || 'kafka-broker-service:9092',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public',
  },
});

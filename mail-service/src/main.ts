import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger();
  const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:9092';
  logger.log(`[MAIL-SERVICE] KAFKA_BROKER: ${kafkaBrokers}`);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification-service-client',
        brokers: [kafkaBrokers],
      },
      consumer: {
        groupId: 'notification-service-consumer-group',
      },
    },
  });
  logger.log(`[NOTIFICATION-SERVICE] KAFKA_BROKER: ${kafkaBrokers}`);
  await app.listen();
  logger.log(`🚀 App is running on port: ${process.env.PORT ?? 3007}`);
}
bootstrap();

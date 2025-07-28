import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');
  const port = Number(process.env.PORT) || 3007;
  const kafkaBrokers = (process.env.KAFKA_BROKER || process.env.KAFKA_BROKERS || 'kafka:9092').split(',');

  const app = await NestFactory.create(AppModule);

  // Cấu hình microservice Kafka
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification-service-client',
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: 'notification-service-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  logger.log(`🚀 HTTP Server is running on http://localhost:${port}`);
}

bootstrap();

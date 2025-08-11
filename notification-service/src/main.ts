import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. HTTP app (REST, health check)
  const httpApp = await NestFactory.create(AppModule);
  await httpApp.listen(process.env.PORT ?? 8006);
  logger.log(`🚀 HTTP server is running on port: ${process.env.PORT ?? 8006}`);

  // 2. Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service-client',
          brokers: [process.env.KAFKA_BROKER ?? 'kafka-broker-service:9092'],
        },
        consumer: {
          groupId: 'notification-service-consumer-group',
        },
      },
    },
  );
  await kafkaApp.listen();
  logger.log(`🚀 Kafka Microservice is running and listening for messages.`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { PrismaService } from './prisma/prisma.service';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. HTTP app (REST, health check)
  const httpApp = await NestFactory.create(AppModule);
  const prismaService = httpApp.get(PrismaService);
  prismaService.enableShutdownHooks(httpApp);
  await httpApp.listen(process.env.PORT ?? 3002);
  logger.log(`🚀 HTTP server is running on port: ${process.env.PORT ?? 3002}`);

  // 2. Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'post-service-client',
          brokers: [process.env.KAFKA_BROKER ?? 'kafka-broker-service:9092'],
        },
        consumer: {
          groupId: 'post-service-consumer-group-v2',
        },
      },
    },
  );
  await kafkaApp.listen();
  logger.log(`🚀 Kafka Microservice is running and listening for messages.`);
}

bootstrap();

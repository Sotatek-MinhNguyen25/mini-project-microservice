/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { KafkaResponseInterceptor } from './shared/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. HTTP app (REST, health check)
  const httpApp = await NestFactory.create(AppModule);
  const prismaService = httpApp.get(PrismaService);
  prismaService.enableShutdownHooks(httpApp as any);
  await httpApp.listen(process.env.PORT ?? 3001);
  logger.log(`🚀 HTTP server is running on port: ${process.env.PORT ?? 3001}`);

  // 2. Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'auth-service-client',
          brokers: [process.env.KAFKA_BROKER ?? 'kafka-broker-service:9092'],
        },
        consumer: {
          groupId: 'auth-service-consumer-group-v2',
        },
      },
    },
  );
  kafkaApp.useGlobalInterceptors(
    new KafkaResponseInterceptor(kafkaApp.get(Reflector)),
  );
  await kafkaApp.listen();
  logger.log(`🚀 Kafka Microservice is running and listening for messages.`);
}

bootstrap();

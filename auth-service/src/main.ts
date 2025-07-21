import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from './config/constants';

// Xóa import DocumentBuilder, SwaggerModule
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service-client',
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
      },
      consumer: {
        groupId: 'auth-service-consumer-group-v2',
      },
    },
  });

  // Xóa toàn bộ phần Swagger setup

  await app.startAllMicroservices();
  const port = configService.get(ENV.PORT);
  await app.listen(port);
  logger.log(`🚀 App is running on port: ${port}`);
  logger.log(`KAFKA_BROKER: ${process.env.KAFKA_BROKER}`);
  logger.log(`REDIS_HOST: ${process.env.REDIS_HOST}`);
  logger.log(`REDIS_PORT: ${process.env.REDIS_PORT}`);
  // Sau khi kết nối Kafka thành công
  logger.log('Kafka client initialized (check logs for errors if any)');
  // Sau khi kết nối Redis thành công (nếu có logic custom, thêm log ở đó)
  logger.log('Redis client initialized (check logs for errors if any)');
}

bootstrap();

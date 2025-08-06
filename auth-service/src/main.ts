/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { KafkaResponseInterceptor } from './shared/interceptors/response.interceptor'; // Đảm bảo đường dẫn chính xác
import { Reflector } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');

    // 1. Thay đổi cách tạo ứng dụng: Tạo một Microservice thuần tuý
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
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

    // Lấy ConfigService từ app context
    // const configService = app.get(ConfigService);
    const prismaService = app.get(PrismaService);

    // 2. Đăng ký Global Interceptor và Global Filter cho Microservice
    // Interceptor này sẽ hoạt động trong ngữ cảnh RPC
    app.useGlobalInterceptors(new KafkaResponseInterceptor(app.get(Reflector)));
    // Đảm bảo bạn cũng đăng ký RpcExceptionFilter để xử lý lỗi nhất quán
    //TODO: cái này handler sau
    // app.useGlobalFilters(new AllRpcExceptionsFilter());

    // 3. Enable shutdown hooks cho Prisma (vẫn giữ nguyên)
    prismaService.enableShutdownHooks(app as any);

    // 4. Bắt đầu lắng nghe Microservice
    await app.listen(); // <-- Không cần .startAllMicroservices() hay .listen(port) riêng nữa
    logger.log(`🚀 Kafka Microservice is running and listening for messages.`);
    const kafkaBrokers =
      process.env.KAFKA_BROKER ?? 'kafka-broker-service:9092';
    logger.log(`[AUTH-SERVICE] KAFKA_BROKER: ${kafkaBrokers}`);
    logger.log(`REDIS_HOST: ${process.env.REDIS_HOST}`);
    logger.log(`REDIS_PORT: ${process.env.REDIS_PORT}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await new Promise((resolve) => {});
  } catch (error) {
    console.error('App crashed:', error);
    process.exit(1);
  }
}

bootstrap();

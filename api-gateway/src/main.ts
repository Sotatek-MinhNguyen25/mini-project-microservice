import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ResponseMessageInterceptor } from './common/interceptor/response.interceptor';

dotenv.config();

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      run: {
        autoCommit: false
      }
    }
  });

  app.enableCors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const configSwagger = new DocumentBuilder()
    .setTitle('Order Service')
    .setDescription('Order Service API description')
    .setVersion('1.0')
    .addTag('orders')
    .build();

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(app, configSwagger),
  );
  const { Reflector } = await import('@nestjs/core');
  app.useGlobalInterceptors(new ResponseMessageInterceptor(new Reflector()));
  await app.listen(port);
  logger.log(`🚀 App is running on port: ${port}`);
}
bootstrap();

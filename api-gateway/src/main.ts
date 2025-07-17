import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ResponseMessageInterceptor } from './common/interceptor/response.interceptor';
import { config } from './configs/configuration';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = config.port || 8000;
  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const configSwagger = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for Microservices')
    .setVersion('1.0')
    .addTag('gateway')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    config.apiPrefix || 'api',
    app,
    SwaggerModule.createDocument(app, configSwagger),
  );
  const { Reflector } = await import('@nestjs/core');
  app.useGlobalInterceptors(new ResponseMessageInterceptor(new Reflector()));
  await app.listen(port);
  logger.log(`🚀 App is running on port: ${port}`);
}
bootstrap();

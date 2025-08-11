import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { ResponseMessageInterceptor } from './common/interceptor/response.interceptor';
import { config } from './configs/configuration';
import { CONFIG_CONSTANTS } from './common/constants/config.constants';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const port = config.port || CONFIG_CONSTANTS.DEFAULT_PORT;

    // Middleware
    app.use(morgan('dev'));

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // CORS configuration
    app.enableCors({
      origin: '*',
      methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Swagger configuration
    const configSwagger = new DocumentBuilder()
      .setTitle('API Gateway Service')
      .setDescription('The API Gateway Service API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup('api', app, document);

    // Global interceptors
    const { Reflector } = await import('@nestjs/core');
    app.useGlobalInterceptors(new ResponseMessageInterceptor(new Reflector()));

    // Start application
    await app.listen(port);

    logger.log(`🚀 App is running on port: ${port}`);
    logger.log(`KAFKA_BROKER: ${process.env.KAFKA_BROKER || CONFIG_CONSTANTS.DEFAULT_KAFKA_BROKER}`);
    logger.log('Kafka client initialized (check logs for errors if any)');
  } catch (error) {
    logger.error('App crashed:', error);
    process.exit(1);
  }
}

bootstrap();

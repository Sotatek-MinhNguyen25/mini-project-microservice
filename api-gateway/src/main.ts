import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { ResponseMessageInterceptor } from './common/interceptor/response.interceptor';
import { config } from './configs/configuration';
// import { HttpExceptionInterceptor } from 'src/common/interceptor/http-exception.interceptor';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
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
      .setTitle('Auth Service')
      .setDescription('The Auth Service API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup('api', app, document);
    const { Reflector } = await import('@nestjs/core');
    app.useGlobalInterceptors(new ResponseMessageInterceptor(new Reflector()));
    await app.listen(port);
    logger.log(`🚀 App is running on port: ${port}`);
    logger.log(`KAFKA_BROKERS: ${process.env.KAFKA_BROKERS}`);
    logger.log('Kafka client initialized (check logs for errors if any)');
  } catch (error) {
    console.error('App crashed:', error);
    process.exit(1);
  }
}
bootstrap();

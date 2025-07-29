import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS ?? 'localhost:29092'],
      },
      consumer: {
        groupId: 'noti-comsumer-group',
        allowAutoTopicCreation: true,
      },
    },
  });
  app.startAllMicroservices();
  app.listen(process.env.PORT ?? 8080, () => {
    logger.log(`Server listen on PORT: ${process.env.PORT}`);
  });
}
bootstrap();

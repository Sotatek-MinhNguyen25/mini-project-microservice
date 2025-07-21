import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mailConfig from '../config/mail.config';
import kafkaConfig from '../config/kafka.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'path';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [path.resolve(process.cwd(), '.env.kafka'), path.resolve(process.cwd(), '.env')],
      load: [mailConfig, kafkaConfig],
      validationSchema: Joi.object({
        KAFKA_BROKERS: Joi.string().required(),
        KAFKA_CLIENT_ID: Joi.string().required(),
        KAFKA_GROUP_ID: Joi.string().required(),
        KAFKA_TOPIC: Joi.string().required(),

        MAILTRAP_HOST: Joi.string().required(),
        MAILTRAP_PORT: Joi.number().required(),
        MAILTRAP_SECURE: Joi.boolean().required(),
        MAILTRAP_USER: Joi.string().required(),
        MAILTRAP_FROM: Joi.string().required(),

      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const brokers = configService.get<string[]>('kafka.brokers') ?? ['localhost:29092'];
          const clientId = configService.get<string>('kafka.clientId') ?? 'notification-service';
          const groupId = configService.get<string>('kafka.groupId') ?? 'notification-group';

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId,
                brokers,
              },
              consumer: {
                groupId,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [NotificationService, KafkaConsumerService],
  exports: [NotificationService],
})
export class NotificationModule {}

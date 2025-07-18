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
        'mail.host': Joi.string().required(),
        'mail.port': Joi.number().required(),
        'mail.secure': Joi.boolean().required(),
        'mail.user': Joi.string().required(),
        'mail.pass': Joi.string().required(),
        'mail.from': Joi.string().required(),
        'app.frontendUrl': Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: (configService: ConfigService) => {
          const brokers = configService.get<string[]>('kafka.brokers') ?? ['localhost:9092'];
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
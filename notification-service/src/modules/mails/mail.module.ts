import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import * as Joi from 'joi';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import mailConfig from 'src/config/mail.config';
import kafkaConfig from 'src/config/kafka.config';
import { KafkaModule } from 'src/kafka/kafka.module';

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
    KafkaModule.register(['notification']),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule { }

import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from 'src/configs/configuration';
import { KAFKA_CLIENTS } from 'src/constants/app.constants';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENTS.AUTH,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [config.kafka.brokers],
            clientId: config.kafka.clientId + '-auth',
          },
          consumer: {
            groupId: config.kafka.clientId + '-auth-group',
          },
        },
      },
      {
        name: KAFKA_CLIENTS.POST,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [config.kafka.brokers],
            clientId: config.kafka.clientId + '-post',
          },
        },
      },
      {
        name: KAFKA_CLIENTS.UPLOAD,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [config.kafka.brokers],
            clientId: config.kafka.clientId + '-upload',
          },
          consumer: {
            groupId: config.kafka.clientId + '-upload-group',
          },
        },
      },
      {
        name: KAFKA_CLIENTS.NOTIFICATION,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [config.kafka.brokers],
            clientId: config.kafka.clientId + '-notification',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule { }

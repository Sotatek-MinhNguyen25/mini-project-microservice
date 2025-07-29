import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CONSTANTS } from '../constant';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CONSTANTS.KAFKA_PATTERN.AUTH,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const kafkaUrl = configService.get('kafka.brokers');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'auth-client',
                brokers: [kafkaUrl],
              },
              consumer: {
                groupId: 'auth-group',
              },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}

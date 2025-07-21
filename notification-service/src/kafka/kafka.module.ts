import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
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
  exports: ['KAFKA_SERVICE'],
})
export class KafkaModule {}

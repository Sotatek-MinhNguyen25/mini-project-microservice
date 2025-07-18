import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENTS } from 'src/constants/app.constants';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENTS.UPLOAD,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'upload-consumer',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'upload-consumer-group',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}

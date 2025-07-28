import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CONSTANTS } from '../constant';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CONSTANTS.KAFKA_PATTERN.AUTH,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_URL || 'localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [KafkaService],
})
export class KafkaModule {}

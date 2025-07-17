import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from 'src/configs/config.service';
import { PostGatewayController } from './post-gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: config.POST_SERVICE_NAME,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'gateway',
            brokers: [config.KAFKA_BROKER],
          },
        },
      },
    ]),
  ],
  controllers: [PostGatewayController],
  providers: [],
})
export class PostGatewayModule {}

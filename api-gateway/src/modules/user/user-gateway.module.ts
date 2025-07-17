import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import { UserGatewayController } from './user-gateway.controller';

@Module({
  imports: [KafkaModule],
  controllers: [UserGatewayController],
})
export class UserGatewayModule {}

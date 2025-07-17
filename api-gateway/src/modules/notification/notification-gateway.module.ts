import { Module } from '@nestjs/common';
import { NotificationGatewayController } from './notification-gateway.controller';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [NotificationGatewayController],
})
export class NotificationGatewayModule {}

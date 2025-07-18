import { Module } from '@nestjs/common';
import { TagGatewayController } from './tag-gateway.controller';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [TagGatewayController],
})
export class TagGatewayModule {}

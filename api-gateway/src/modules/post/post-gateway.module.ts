import { Module } from '@nestjs/common';
import { PostGatewayController } from './post-gateway.controller';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [PostGatewayController],
})
export class PostGatewayModule {}

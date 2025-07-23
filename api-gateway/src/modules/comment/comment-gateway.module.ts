import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import { CommentGatewayController } from './comment-gateway.controller';

@Module({
  imports: [KafkaModule],
  controllers: [CommentGatewayController],
})
export class CommentGatewayModule {}

import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule.register(['auth'])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}

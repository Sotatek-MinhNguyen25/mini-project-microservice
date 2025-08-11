import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaClient } from '@prisma/client';
import { CommentService } from 'src/comment/comment.service';
import { ReactionService } from 'src/reaction/reaction.service';
import { BullModule } from '@nestjs/bullmq';
import { postHideQueueName } from 'src/jobs/post-hide.job';
import { PostHideProcessor } from 'src/jobs/post-hide.processor';

@Module({
  imports: [
    KafkaModule.register(['noti']),
    BullModule.registerQueue({
      name: postHideQueueName,
      connection: process.env.REDIS_URL
        ? {
            url: process.env.REDIS_URL,
            tls: {},
          }
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            tls: {},
          },
    }),
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PrismaClient,
    CommentService,
    ReactionService,
    PostHideProcessor,
  ],
})
export class PostModule {}

import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaClient } from '@prisma/client';
import { CommentModule } from 'src/comment/comment.module';
import { CommentService } from 'src/comment/comment.service';
import { ReactionService } from 'src/reaction/reaction.service';

@Module({
  imports: [KafkaModule.register(['comment'])],
  controllers: [PostController],
  providers: [PostService, PrismaClient, CommentService, ReactionService],
})
export class PostModule {}

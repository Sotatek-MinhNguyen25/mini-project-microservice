import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, PrismaClient],
})
export class PostModule {}

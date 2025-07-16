import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { CommentController } from './comment/comment.controller';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        return env;
      },
    }),
    PrismaService,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController, CommentController],
  providers: [AppService],
})
export class AppModule {}

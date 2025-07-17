import { Inject, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}
  async create(createCommentDto: CreateCommentDto) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        postId: createCommentDto.postId,
      },
    });
    return comment;
  }

  async findAll(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId: postId,
      },
    });
    const userIdList = [...new Set(comments.map((comment) => comment.userId))];

    const userInfo = await firstValueFrom(
      this.authClient.send('findAllUser', { userIds: userIdList }),
    );

    const result = comments.map((comment) => ({
      ...comment,
      user: userInfo.find((u) => u.id === comment.userId),
    }));
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}

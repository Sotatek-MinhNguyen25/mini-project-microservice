import { Inject, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CONSTANTS } from 'constants/app.constants';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        userId: createCommentDto.userId,
        postId: createCommentDto.postId,
      },
    });
    if (comment) {
      throw new RpcException({
        status: 409,
        message: 'Comment already excisted',
      });
    }
    const newComment = await this.prismaService.comment.create({
      data: createCommentDto,
    });
    return { data: newComment, meta: {} };
  }

  async countCommentsByPostId(postId: string) {
    return await this.prismaService.comment.count({
      where: {
        postId: postId,
      },
    });
  }

  async getCommentsByPostId(postId: string) {
    const comments = await this.prismaService.comment.findMany({
      where: {
        postId: postId,
        deletedAt: null,
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

  async update(updateCommentDto: UpdateCommentDto) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: updateCommentDto.id,
      },
    });
    if (!comment) {
      throw new RpcException({
        status: 404,
        message: 'Comment not found',
      });
    }
    return await this.prismaService.comment.update({
      where: {
        id: updateCommentDto.id,
      },
      data: updateCommentDto,
    });
  }

  async delete(id: string) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: id,
      },
    });
    if (!comment) {
      throw new RpcException({ status: 404, message: 'Comment not found' });
    }

    // soft delete
    return await this.prismaService.comment.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

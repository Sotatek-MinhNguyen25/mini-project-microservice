import { Inject, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CONSTANTS } from 'constants/app.constants';
import { ConsumerResult } from '../common/type/consumer-result';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
  ): Promise<ConsumerResult<Comment>> {
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
    const createdComment = await this.prismaService.comment.create({
      data: createCommentDto,
    });
    return { data: createdComment, meta: {} };
  }

  async countCommentsByPostId(postId: string): Promise<ConsumerResult<number>> {
    const count = await this.prismaService.comment.count({
      where: {
        postId: postId,
        deletedAt: null,
      },
    });
    return { data: count, meta: {} };
  }

  async getCommentsByPostId(
    postId: string,
  ): Promise<ConsumerResult<Comment[]>> {
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
    return { data: result, meta: {} };
  }

  async update(
    updateCommentDto: UpdateCommentDto,
  ): Promise<ConsumerResult<Comment>> {
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
    const updatedComment = await this.prismaService.comment.update({
      where: {
        id: updateCommentDto.id,
      },
      data: updateCommentDto,
    });
    return { data: updatedComment, meta: {} };
  }

  async delete(id: string): Promise<ConsumerResult<Comment>> {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: id,
      },
    });
    if (!comment) {
      throw new RpcException({ status: 404, message: 'Comment not found' });
    }

    // soft delete
    const deletedComment = await this.prismaService.comment.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { data: deletedComment, meta: {} };
  }
}

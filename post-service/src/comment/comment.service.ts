import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { ConsumerResult } from '../common/type/consumer-result';
import { Comment } from '@prisma/client';
import { User } from 'src/common/type/user';
import { RpcNotFoundException } from 'src/common/exception/rpc.exception';
import * as _ from 'lodash';

@Injectable()
export class CommentService implements OnModuleInit {
  constructor(
    private prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS,
    );
  }

  async create(
    createCommentDto: CreateCommentDto,
  ): Promise<ConsumerResult<Comment>> {
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

  async getCommentsByPostId(postId: string): Promise<ConsumerResult<any[]>> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        postId: postId,
        deletedAt: null,
      },
    });
    const userIdList = [...new Set(comments.map((comment) => comment.userId))];

    const userInfo: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, {
          ids: userIdList,
        }),
      )
    ).data;

    const result = comments.map((comment) => ({
      ..._.pick(comment, ['id', 'content', 'createdAt']),
      user: _.pick(
        userInfo.find((u) => u.id === comment.userId),
        ['id', 'email', 'username'],
      ),
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
      throw new RpcNotFoundException('Comment not found');
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
      throw new RpcNotFoundException('Comment not found');
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

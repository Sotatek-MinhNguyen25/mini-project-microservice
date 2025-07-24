import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReactionDto, UpdateReactionDto } from './reaction.dto';
import { Reaction } from '@prisma/client';
import { ClientKafka } from '@nestjs/microservices';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { ReactionSummary } from './reaction.interface';
import { ConsumerResult } from 'src/common/type/consumer-result';
import { firstValueFrom } from 'rxjs';
import {
  RpcConflictException,
  RpcNotFoundException,
} from 'src/common/exception/rpc.exception';
import { User } from 'src/common/type/user';
import * as _ from 'lodash';

@Injectable()
export class ReactionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  //get all reactions of a post
  async getReactionsByPostId(postId: string): Promise<ConsumerResult<any[]>> {
    const reactions = await this.prismaService.reaction.findMany({
      where: {
        postId: postId,
        deletedAt: null,
      },
    });
    // should we show the name of user who reacted?
    const userIds = [...new Set(reactions.map((reaction) => reaction.userId))];
    const users: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, {
          ids: userIds,
        }),
      )
    ).data;
    // Anh xa user vao reaction
    const result = reactions.map((reaction) => {
      const userReaction = users.find((user) => user.id === reaction.userId);
      return {
        ..._.pick(reaction, ['id', 'type', 'createdAt']),
        user: _.pick(userReaction, ['id', 'email', 'username']),
      };
    });
    return { data: result, meta: {} };
  }

  async getReactionsSummaryByPostId(
    postId: string,
  ): Promise<ConsumerResult<{ count: number; summary: ReactionSummary[] }>> {
    const count = await this.prismaService.reaction.count({
      where: {
        postId: postId,
        deletedAt: null,
      },
    });
    const summary = await this.prismaService.reaction.groupBy({
      where: {
        postId: postId,
      },
      by: ['type'],
      _count: {
        _all: true,
      },
    });
    const formattedSummary: ReactionSummary[] = summary.map((item) => ({
      type: item.type,
      count: item._count._all,
    }));
    return { data: { count: count, summary: formattedSummary }, meta: {} };
  }

  async createReaction(
    createReactionDto: CreateReactionDto,
  ): Promise<ConsumerResult<Reaction>> {
    // Tim kiem xem user da tung reaction chua
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        postId: createReactionDto.postId,
        userId: createReactionDto.userId,
      },
    });
    let reactionRes: Reaction;
    // Neu user chua tung reaction
    if (!reaction) {
      reactionRes = await this.prismaService.reaction.create({
        data: createReactionDto,
      });
      return { data: reactionRes };
    }

    // Neu user huy reaction bang cach reaction tuong tu reaction da tao
    if (reaction.type === createReactionDto.type && !reaction.deletedAt) {
      reactionRes = await this.prismaService.reaction.update({
        where: {
          id: reaction.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return { data: reactionRes };
    }

    // Thay doi reaction
    reactionRes = await this.prismaService.reaction.update({
      where: {
        id: reaction.id,
      },
      data: {
        type: createReactionDto.type,
        deletedAt: null,
      },
    });
    return { data: reactionRes };
  }

  async updateReaction(
    updateReactionDto: UpdateReactionDto,
  ): Promise<ConsumerResult<Reaction>> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id: updateReactionDto.id,
        deletedAt: null,
      },
    });
    if (!reaction) {
      throw new RpcNotFoundException(
        'User has not reacted to this post or has has been deleted',
      );
    }
    // check for permission?

    const updatedReaction = await this.prismaService.reaction.update({
      where: {
        id: updateReactionDto.id,
      },
      data: updateReactionDto,
    });
    return { data: updatedReaction, meta: {} };
  }

  async deleteReaction(id: string): Promise<ConsumerResult<Reaction>> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id,
      },
    });
    if (!reaction) {
      throw new RpcNotFoundException('Reaction not found');
    }

    // soft delete
    const deletedReaction = await this.prismaService.reaction.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { data: deletedReaction, meta: {} };
  }
}

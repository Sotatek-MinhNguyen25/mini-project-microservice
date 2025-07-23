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

@Injectable()
export class ReactionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  //get all reactions of a post
  async getReactionsByPostId(
    postId: string,
  ): Promise<ConsumerResult<Reaction[]>> {
    const reactions = await this.prismaService.reaction.findMany({
      where: {
        postId: postId,
      },
    });
    // should we show the name of user who reacted?
    const userIds = [...new Set(reactions.map((reaction) => reaction.userId))];
    const userInfo = await firstValueFrom(
      this.authClient.send('findAllUser', { userIds: userIds }),
    );
    return { data: reactions, meta: {} };
  }

  async getReactionsSummaryByPostId(
    postId: string,
  ): Promise<ConsumerResult<{ count: number; summary: ReactionSummary[] }>> {
    const count = await this.prismaService.reaction.count({
      where: {
        postId: postId,
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
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        postId: createReactionDto.postId,
        userId: createReactionDto.userId,
      },
    });
    if (reaction) {
      // redirect to update reaction?
      throw new RpcConflictException('User has already reacted to this post');
    }
    const createdReaction = await this.prismaService.reaction.create({
      data: createReactionDto,
    });
    return { data: createdReaction, meta: {} };
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

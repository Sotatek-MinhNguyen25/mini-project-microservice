import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReactionDto, UpdateReactionDto } from './reaction.dto';
import { Reaction } from '@prisma/client';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { CONSTANTS } from 'constants/app.constants';
import { ReactionSummary } from './reaction.interface';
// import { firstValueFrom } from 'rxjs';

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
  ): Promise<{ data: Reaction[]; meta: any }> {
    const reactions = await this.prismaService.reaction.findMany({
      where: {
        postId: postId,
      },
    });
    // should we show the name of user who reacted?
    // const userIds = [...new Set(reactions.map((reaction) => reaction.userId))];
    // const userInfo = await firstValueFrom(
    //   this.authClient.send('findAllUser', { userIds: userIds }),
    // );
    return { data: reactions, meta: {} };
  }

  async getReactionsSummaryByPostId(postId: string): Promise<{
    data: { count: number; summary: ReactionSummary[] };
    meta: any;
  }> {
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
  ): Promise<{ data: Reaction; meta: any }> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        postId: createReactionDto.postId,
        userId: createReactionDto.userId,
      },
    });
    if (reaction) {
      // redirect to update reaction?
      throw new RpcException({
        status: 409,
        message: 'User has already reacted to this post',
      });
    }
    const createdReaction = await this.prismaService.reaction.create({
      data: createReactionDto,
    });
    return { data: createdReaction, meta: {} };
  }

  async updateReaction(
    updateReactionDto: UpdateReactionDto,
  ): Promise<{ data: Reaction; meta: any }> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id: updateReactionDto.id,
        deletedAt: null,
      },
    });
    if (!reaction) {
      throw new RpcException({
        status: 404,
        message: 'User has not reacted to this post or has has been deleted',
      });
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

  async deleteReaction(id: string): Promise<{ data: Reaction; meta: any }> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id,
      },
    });
    if (!reaction) {
      throw new RpcException({ status: 404, message: 'Reaction not found' });
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

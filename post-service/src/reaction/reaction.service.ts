import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReactionDto, UpdateReactionDto } from './reaction.dto';
import { Reaction } from '@prisma/client';
import { ClientKafka } from '@nestjs/microservices';
import { CONSTANTS } from 'constants/app.constants';
// import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReactionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  async getReactionsByPostId(
    id: string,
  ): Promise<{ reaction: Reaction[]; count: number }> {
    const reactions = await this.prismaService.reaction.findMany({
      where: {
        postId: id,
      },
    });
    // const userIds = [...new Set(reactions.map((reaction) => reaction.userId))];
    // const userInfo = await firstValueFrom(
    //   this.authClient.send('findAllUser', { userIds: userIds }),
    // );
    // count the number of total reactions
    // should we count the number of unique reactions and unique users?
    // should we show the name of user who reacted?
    return { reaction: reactions, count: reactions.length };
  }

  async createReaction(
    createReactionDto: CreateReactionDto,
  ): Promise<Reaction> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        postId: createReactionDto.postId,
        userId: createReactionDto.userId,
      },
    });
    if (reaction) {
      // redirect to update reaction?
      throw new ConflictException('User has already reacted to this post');
    }
    return await this.prismaService.reaction.create({
      data: createReactionDto,
    });
  }

  async updateReaction(
    updateReactionDto: UpdateReactionDto,
  ): Promise<Reaction> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id: updateReactionDto.id,
      },
    });
    if (!reaction) {
      throw new NotFoundException('User has not reacted to this post');
    }
    return await this.prismaService.reaction.update({
      where: {
        id: updateReactionDto.id,
      },
      data: updateReactionDto,
    });
  }

  async deleteReaction(id: string): Promise<Reaction> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        id,
      },
    });
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    return await this.prismaService.reaction.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

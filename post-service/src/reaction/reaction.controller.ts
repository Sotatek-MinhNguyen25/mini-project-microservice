import { Body, Controller } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto, UpdateReactionDto } from './reaction.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @MessagePattern('getReactionsByPostId')
  getReactionsByPostId(@Payload() postId: string) {
    return this.reactionService.getReactionsByPostId(postId);
  }

  @MessagePattern('createReaction')
  createReaction(@Payload() reaction: CreateReactionDto) {
    return this.reactionService.createReaction(reaction);
  }

  @MessagePattern('updateReaction')
  updateReaction(@Payload() reaction: UpdateReactionDto) {
    return this.reactionService.updateReaction(reaction);
  }

  @MessagePattern('deleteReaction')
  deleteReaction(@Payload() id: string) {
    return this.reactionService.deleteReaction(id);
  }
}

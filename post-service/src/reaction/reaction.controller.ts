import { Body, Controller } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto, UpdateReactionDto } from './reaction.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CONSTANTS } from 'constants/app.constants';

@Controller()
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.GET_BY_POST)
  getReactionsByPostId(@Payload() postId: string) {
    return this.reactionService.getReactionsByPostId(postId);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.CREATE)
  createReaction(@Payload() reaction: CreateReactionDto) {
    return this.reactionService.createReaction(reaction);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.UPDATE)
  updateReaction(@Payload() reaction: UpdateReactionDto) {
    return this.reactionService.updateReaction(reaction);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.DELETE)
  deleteReaction(@Payload() id: string) {
    return this.reactionService.deleteReaction(id);
  }
}

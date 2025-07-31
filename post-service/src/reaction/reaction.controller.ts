import { Body, Controller } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto, UpdateReactionDto } from './dto/reaction.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CONSTANTS } from 'src/common/constants/app.constants';

@Controller()
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.GET_BY_POST)
  getReactionsByPostId(@Payload() postId: string) {
    return this.reactionService.getReactionsByPostId(postId);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.GET_SUMMARY_BY_POST)
  getReactionsSummaryByPostId(@Payload() postId: string) {
    return this.reactionService.getReactionsSummaryByPostId(postId);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.CREATE)
  createReaction(@Payload() createReactionDto: CreateReactionDto) {
    return this.reactionService.createReaction(createReactionDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.UPDATE)
  updateReaction(@Payload() updateReactionDto: UpdateReactionDto) {
    return this.reactionService.updateReaction(updateReactionDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.REACTION.DELETE)
  deleteReaction(@Payload() id: string) {
    return this.reactionService.deleteReaction(id);
  }
}

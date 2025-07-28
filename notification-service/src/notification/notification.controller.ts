import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CONSTANTS } from 'src/common/constant';
import { CommentEventDto } from './dto/comment.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.COMMENT)
  commentEvent(@Payload() replyCommentDto: CommentEventDto) {
    return this.notificationService.replyComment(replyCommentDto);
  }
}

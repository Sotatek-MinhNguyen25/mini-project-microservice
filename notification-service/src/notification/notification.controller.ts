import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CONSTANTS } from 'src/common/constant';
import { ReplyCommentDto } from './dto/comment.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.COMMENT.REPLY)
  replyComment(@Payload() replyCommentDto: any) {
    console.log('Hello');
    return this.notificationService.replyComment(replyCommentDto);
  }
}

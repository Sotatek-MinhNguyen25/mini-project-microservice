import { Injectable } from '@nestjs/common';
import { ReplyCommentDto } from './dto/comment.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
@Injectable()
export class NotificationService {
  constructor(private socketGatway: SocketGateway) {}
  replyComment(replyCommentDto: ReplyCommentDto) {
    const { commentId, userId } = replyCommentDto;
    this.socketGatway.replyComment({ commentId, userId });
  }
}

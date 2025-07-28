import { Injectable } from '@nestjs/common';
import { CommentEventDto } from './dto/comment.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
@Injectable()
export class NotificationService {
  constructor(private socketGatway: SocketGateway) {}

  replyComment(commentEventDto: CommentEventDto) {
    const { postId, from, to } = commentEventDto;
    return this.socketGatway.commentEvent({ postId, from, to });
  }
}

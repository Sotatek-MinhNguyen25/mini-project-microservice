import { Injectable } from '@nestjs/common';
import { CommentEventDto } from './dto/comment.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ReactionDto } from './dto/reaction.dto';
@Injectable()
export class NotificationService {
  constructor(private socketGatway: SocketGateway) {}

  replyComment(commentEventDto: CommentEventDto) {
    const { postId, from, to } = commentEventDto;
    return this.socketGatway.commentEvent({ postId, from, to });
  }

  reaction(reactionDto: ReactionDto) {
    return this.socketGatway.reactionEvent(reactionDto);
  }
}

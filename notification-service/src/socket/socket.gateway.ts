import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { CommentEventDto } from 'src/notification/dto/comment.dto';
import { ReactionDto } from 'src/notification/dto/reaction.dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private socketService: SocketService) {}

  @WebSocketServer()
  server: Server;

  private logger = new Logger();

  afterInit(server: Server) {
    this.logger.log('Websocket initialized');
  }

  handleConnection(client: Socket) {
    return this.socketService.handleConnection(client);
  }

  commentEvent(data: CommentEventDto) {
    return this.socketService.commentEvent(this.server, data);
  }

  reactionEvent(data: ReactionDto) {
    return this.socketService.reactionEvent(this.server, data);
  }

  handleDisconnect(client: Socket) {
    return this.socketService.handleDisconnect(client);
  }
}

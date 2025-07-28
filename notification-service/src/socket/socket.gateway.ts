import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

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

  replyComment(data: any) {
    return this.socketService.replyComment(this.server, data);
  }

  handleDisconnect(client: Socket) {}
}

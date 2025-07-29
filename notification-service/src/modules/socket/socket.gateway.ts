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

  sendTrigger(receiverId: string) {
    this.socketService.sendTrigger(this.server, receiverId);
  }

  handleDisconnect(client: Socket) {
    return this.socketService.handleDisconnect(client);
  }
}

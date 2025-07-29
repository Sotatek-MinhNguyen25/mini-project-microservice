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

  private logger = new Logger(SocketGateway.name);

  afterInit(server: Server) {
    this.logger.log('Websocket initialized');
  }

  handleConnection(client: Socket) {
    try {
      this.socketService.handleConnection(client);
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  sendTrigger(receiverId: string) {
    this.socketService.sendTrigger(this.server, receiverId);
  }

  handleDisconnect(client: Socket) {
    try {
      this.socketService.handleDisconnect(client);
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}

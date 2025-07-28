import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger();
  constructor() {}

  afterInit(server: Server) {
    this.logger.log('Websocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth.accessToken || 'token';
    if (token) {
      client.join('room1');
    }
    this.logger.log(`Client ${client.id} conecting...`);
  }

  sendMessage() {
    console.log('Hello');
    this.server.to('room1').emit('emitMessage', 'hello');
  }

  handleDisconnect(client: any) {}
}

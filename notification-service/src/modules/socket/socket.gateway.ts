import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Inject, Logger } from '@nestjs/common';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constant';
import { Server, Socket } from 'socket.io';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway()
export class SocketGateway {
  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    @Inject(KAFKA_CLIENTS.AUTH) private readonly clientAuth: ClientKafka,
    private readonly socketService: SocketService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.socketService.setServer(this.server);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake?.auth?.token;
    if (!token) {
      client.disconnect();
      return;
    }

    let payload: any;
    let userId: string;
    try {
      payload = await firstValueFrom(this.clientAuth.send(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN, { token }));
      console.log(payload);
      userId = payload.data.sub;
      client.join(userId);
      this.logger.log(`Socket connected: ${client.id} - joined room: ${userId}`);
    } catch (error) {
      this.logger.error(`Socket connection failed for client: ${client.id} - invalid token`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }
}

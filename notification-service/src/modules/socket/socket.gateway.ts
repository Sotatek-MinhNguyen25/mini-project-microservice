import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constant';
import { Server, Socket } from 'socket.io';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KafkaService } from 'src/kafka/kafka.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway {
  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly socketService: SocketService,
  ) { }


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

    try {
      const payload = await this.kafkaService.verifyToken(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN, { token })

      const userId = payload.data.sub;
      client.join(userId);
      this.logger.log(`Socket connected: ${client.id} - joined room: ${userId}`);
    } catch (error) {
      this.logger.error(`Invalid token from client: ${client.id}`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }
}

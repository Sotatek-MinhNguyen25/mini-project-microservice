import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { CONSTANTS } from 'src/common/constant';

@Injectable()
export class SocketService implements OnModuleInit {
  constructor(
    @Inject(CONSTANTS.KAFKA_PATTERN.AUTH) private authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN,
    );

    await this.authClient.connect();
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.accessToken;
    if (token) {
      const payload = await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN, {
          token: token,
        }),
      );
      if (!payload) {
        return client.disconnect();
      }
      return await client.join(`${payload.data.sub}`);
    } else {
      return client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const token = client.handshake.auth.accessToken;
    if (token) {
      const payload = await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN, {
          token: token,
        }),
      );
      return await client.leave(`${payload.data.sub}`);
    }
  }

  sendTrigger(server: Server, receiverId: string) {
    server.to(receiverId).emit(CONSTANTS.WS_EVENTS.NOTI_TRIGGER);
  }
}

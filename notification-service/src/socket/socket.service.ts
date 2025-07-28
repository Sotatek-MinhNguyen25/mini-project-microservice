import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { CONSTANTS } from 'src/common/constant';

@Injectable()
export class SocketService implements OnModuleInit {
  constructor(@Inject('KAFKA_AUTH_SERVICE') private authClient: ClientKafka) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN,
    );

    await this.authClient.connect();
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.accessToken;
    console.log(client.handshake);
    try {
      const payload = await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN, {
          token: token,
        }),
      );
      console.log(payload);
      client.join(`${payload.userId}`);
    } catch (error) {
      console.log(error);
    }
  }
  replyComment(server: Server, data: any) {
    server.to(`${data.userId}`).emit('emitMessage', {
      message: 'This is message',
      ...data,
    });
  }
}

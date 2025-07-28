import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { CONSTANTS } from 'src/common/constant';

@Injectable()
export class SocketService {
  constructor(@Inject('KAFKA_AUTH_SERVICE') private authClient: ClientKafka) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.accessToken;
    if (token) {
      const payload = await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.VERIFY_TOKEN, {
          token: token,
        }),
      );
      client.join(`${payload.userId}`);
    }
  }
  replyComment(server: Server, data: any) {
    server.to(`${data.userId}`).emit('emitMessage', {
      message: 'This is message',
      ...data,
    });
  }
}

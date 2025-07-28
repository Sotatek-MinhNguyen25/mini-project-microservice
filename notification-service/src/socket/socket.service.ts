import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { CONSTANTS } from 'src/common/constant';
import { CommentEventDto } from 'src/notification/dto/comment.dto';

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
      await client.join(`${payload.data.sub}`);
    }
  }

  commentEvent(server: Server, data: CommentEventDto) {
    server.to(`${data.to}`).emit(CONSTANTS.WS_MESSAGE_PATTERN.COMMENT_REPLY, {
      message: 'This is message',
      type: 'comment',
      ...data,
    });
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
}

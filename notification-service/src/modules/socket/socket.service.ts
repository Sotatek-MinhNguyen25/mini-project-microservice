import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
    private readonly logger = new Logger(SocketService.name)
    private io: Server;

    setServer(io: Server) {
        this.io = io;
    }

    async sendNotiByUserId(data: Notification) {
        this.io.to(data.receiverId).emit("notification", data)
        this.logger.log(`Notification sent to user ${data.receiverId}`);
    }
}

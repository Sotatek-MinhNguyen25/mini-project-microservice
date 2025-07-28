import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from '../socket/socket.service';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constant';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly socketService: SocketService,
        private readonly kafkaService: KafkaService
    ) { }

    async createNotification(dto: CreateNotificationDto) {
        try {
            const sender = await this.kafkaService.findUser(KAFKA_PATTERNS.USER.FIND_ONE, dto.senderId);

            let content = '';
            if (dto.type === 'REACTION') {
                content = `${sender.data.username} đã bày tỏ cảm xúc vào bài viết của bạn`;
            } else if (dto.type === 'COMMENT') {
                content = `${sender.data.username} đã bình luận vào bài viết của bạn`;
            }

            const notification = await this.prisma.notification.create({
                data: {
                    receiverId: dto.receiverId,
                    senderId: dto.senderId,
                    postId: dto.postId,
                    type: dto.type,
                    content,
                    isRead: false
                },
            });

            await this.socketService.sendNotiByUserId({
                ...notification,
            });

        } catch (error) {
            this.logger.error('Error creating notification:', error);
            throw error;
        }
    }
}

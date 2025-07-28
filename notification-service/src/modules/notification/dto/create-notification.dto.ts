import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsUUID()
    receiverId: string;

    @IsUUID()
    senderId: string;

    @IsUUID()
    postId: string;

    @IsEnum(NotificationType)
    type: NotificationType;
}

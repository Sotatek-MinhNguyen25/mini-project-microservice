import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constant';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @EventPattern(KAFKA_PATTERNS.NOTIFICATION.CREATE)
  async createNotification(@Payload() dto: CreateNotificationDto) {
    console.log(dto)
    return await this.notificationService.createNotification(dto);
  }
}

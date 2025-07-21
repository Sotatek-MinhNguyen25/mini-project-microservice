import { Controller, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { NotificationService } from '../notification/notification.service';
import { KAFKA_MESSAGE_TYPES } from 'src/kafka/constants';

@Injectable()
@Controller()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  @MessagePattern(KAFKA_MESSAGE_TYPES.WELCOME_EMAIL)
  async handleWelcomeEmail(@Payload() payload: { email: string; username: string }, @Ctx() context: KafkaContext) {
    try {
      this.logger.log(`Processing ${KAFKA_MESSAGE_TYPES.WELCOME_EMAIL} message for ${payload.email}`);
      await this.notificationService.sendWelcomeEmail(payload.email, payload.username);
      this.logger.log(`Successfully sent welcome email to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Error processing ${KAFKA_MESSAGE_TYPES.WELCOME_EMAIL} message: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern(KAFKA_MESSAGE_TYPES.PASSWORD_RESET_EMAIL)
  async handlePasswordResetEmail(@Payload() payload: { email: string; resetToken: string }, @Ctx() context: KafkaContext) {
    try {
      this.logger.log(`Processing ${KAFKA_MESSAGE_TYPES.PASSWORD_RESET_EMAIL} message for ${payload.email}`);
      await this.notificationService.sendPasswordResetEmail(payload.email, payload.resetToken);
      this.logger.log(`Successfully sent password reset email to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Error processing ${KAFKA_MESSAGE_TYPES.PASSWORD_RESET_EMAIL} message: ${error.message}`);
      throw error;
    }
  }
}
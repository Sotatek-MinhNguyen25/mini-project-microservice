import { Controller, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload, EventPattern } from '@nestjs/microservices';
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

  @EventPattern(KAFKA_MESSAGE_TYPES.VERIFY_REGISTER_EMAIL)
  async handleVerifyRegisterEmail(@Payload() payload: { email: string; otp: string }) {
    try {
      this.logger.log(`Processing ${KAFKA_MESSAGE_TYPES.VERIFY_REGISTER_EMAIL} message for ${payload.email}`);
      await this.notificationService.sendVerifyRegisterEmail(payload.email, payload.otp);
      this.logger.log(`Successfully sent verify register email to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Error processing ${KAFKA_MESSAGE_TYPES.VERIFY_REGISTER_EMAIL} message: ${error.message}`);
      throw error;
    }
  }

  @EventPattern(KAFKA_MESSAGE_TYPES.WELCOME_EMAIL)
  async handleWelcomeEmail(@Payload() payload: { email: string; username: string }) {
    try {
      this.logger.log(`Processing ${KAFKA_MESSAGE_TYPES.WELCOME_EMAIL} message for ${payload.email}`);
      await this.notificationService.sendWelcomeEmail(payload.email, payload.username);
      this.logger.log(`Successfully sent welcome email to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Error processing ${KAFKA_MESSAGE_TYPES.WELCOME_EMAIL} message: ${error.message}`);
      throw error;
    }
  }

  @EventPattern(KAFKA_MESSAGE_TYPES.NOTIFICATION_FORGOT_PASSWORD)
  async handlePasswordResetEmail(@Payload() payload: { email: string; otp: string }) {
    try {
      this.logger.log(`Processing ${KAFKA_MESSAGE_TYPES.NOTIFICATION_FORGOT_PASSWORD} message for ${payload.email}`);
      await this.notificationService.sendPasswordResetEmail(payload.email, payload.otp);
      this.logger.log(`Successfully sent password reset email to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Error processing ${KAFKA_MESSAGE_TYPES.PASSWORD_RESET_EMAIL} message: ${error.message}`);
      throw error;
    }
  }
}

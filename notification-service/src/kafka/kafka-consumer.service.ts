import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, EachMessagePayload } from 'kafkajs';
import { NotificationService } from '../notification/notification.service';
import { KAFKA_MESSAGE_TYPES } from 'src/kafka/constants';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId') ?? 'notification-service',
      brokers: this.configService.get<string[]>('kafka.brokers') ?? ['localhost:9092'],
    });
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>('kafka.groupId') ?? 'notification-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.configService.get<string>('kafka.topic') ?? 'notification-topic',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          const { type, payload } = data;

          switch (type) {
            case KAFKA_MESSAGE_TYPES.WELCOME_EMAIL:
              await this.notificationService.sendWelcomeEmail(payload.email, payload.username);
              break;
            case KAFKA_MESSAGE_TYPES.PASSWORD_RESET_EMAIL:
              await this.notificationService.sendPasswordResetEmail(payload.email, payload.resetToken);
              break;
            default:
              console.warn(`Unknown message type: ${type}`);
          }
        } catch (error) {
          console.error(`Error processing Kafka message: ${error.message}`);
        }
      },
    });
  }
}

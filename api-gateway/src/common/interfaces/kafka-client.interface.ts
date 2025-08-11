import { ClientKafka } from '@nestjs/microservices';

export interface IKafkaClient {
  subscribeToResponseOf(pattern: string): void;
  send(pattern: string, data: any): any;
  emit(pattern: string, data: any): any;
}

export interface IAuthKafkaClient extends IKafkaClient {
  // Auth-specific methods if needed
}

export interface IPostKafkaClient extends IKafkaClient {
  // Post-specific methods if needed
}

export interface IUploadKafkaClient extends IKafkaClient {
  // Upload-specific methods if needed
}

export interface INotificationKafkaClient extends IKafkaClient {
  // Notification-specific methods if needed
}

export interface IUserKafkaClient extends IKafkaClient {
  // User-specific methods if needed
}

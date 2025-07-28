import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SocketModule } from '../socket/socket.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [SocketModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './modules/notification/notification.module';
import { SocketModule } from './modules/socket/socket.module';
import { MailModule } from './modules/mails/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [MailModule, NotificationModule, SocketModule, PrismaModule, KafkaModule.register(['notification'])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

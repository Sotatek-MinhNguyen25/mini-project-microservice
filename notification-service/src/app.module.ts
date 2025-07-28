import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './modules/notification/notification.module';
import { SocketModule } from './modules/socket/socket.module';
import { MailModule } from './modules/mails/mail.module';

@Module({
  imports: [MailModule, NotificationModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mails/mail.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [MailModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

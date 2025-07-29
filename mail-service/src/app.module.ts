import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mails/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

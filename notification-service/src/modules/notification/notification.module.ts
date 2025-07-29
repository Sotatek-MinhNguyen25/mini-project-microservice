import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SocketModule } from 'src/modules/socket/socket.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [SocketModule],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
})
export class NotificationModule {}

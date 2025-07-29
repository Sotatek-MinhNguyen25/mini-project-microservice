import { Controller, Get, Inject, OnModuleInit, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser } from 'src/common/decorator/auth-user.decorator';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { NotiQueryDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.NOTIFICATION) private notificationClient: ClientKafka) {}

  async onModuleInit() {
    this.notificationClient.subscribeToResponseOf(KAFKA_PATTERNS.NOTIFICATION.LIST);

    await this.notificationClient.connect();
  }

  @Get()
  @ApiBearerAuth()
  async getAll(@AuthUser() user: JwtPayload, @Query() notiQueryDto: NotiQueryDto) {
    return await firstValueFrom(
      this.notificationClient.send(KAFKA_PATTERNS.NOTIFICATION.LIST, { ...notiQueryDto, userId: user.sub }),
    );
  }
}

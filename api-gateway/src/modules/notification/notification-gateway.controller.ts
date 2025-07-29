import { Controller, Get, Inject, OnModuleInit, Param, Put, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthUser } from 'src/common/decorator/auth-user.decorator';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { NotiQueryDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.NOTIFICATION) private notificationClient: ClientKafka) {}

  async onModuleInit() {
    this.notificationClient.subscribeToResponseOf(KAFKA_PATTERNS.NOTIFICATION.LIST);
    this.notificationClient.subscribeToResponseOf(KAFKA_PATTERNS.NOTIFICATION.MARK_READ);
    this.notificationClient.subscribeToResponseOf(KAFKA_PATTERNS.NOTIFICATION.MARK_ALL_READ);

    await this.notificationClient.connect();
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async getAll(@AuthUser() user: JwtPayload, @Query() notiQueryDto: NotiQueryDto) {
    return await firstValueFrom(
      this.notificationClient.send(KAFKA_PATTERNS.NOTIFICATION.LIST, { ...notiQueryDto, userId: user.sub }),
    );
  }

  @Put(':id')
  @ApiBearerAuth()
  async updateById(@AuthUser() user: JwtPayload, @Param('id') id: string) {
    return await firstValueFrom(
      this.notificationClient.send(KAFKA_PATTERNS.NOTIFICATION.MARK_READ, { userId: user.sub, notificationId: id }),
    );
  }

  @Put('all')
  @ApiBearerAuth()
  async updateAll(@AuthUser() user: JwtPayload) {
    return await firstValueFrom(
      this.notificationClient.send(KAFKA_PATTERNS.NOTIFICATION.MARK_ALL_READ, { userId: user.sub }),
    );
  }
}

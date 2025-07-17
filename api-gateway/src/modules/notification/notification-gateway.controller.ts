import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { IUser } from '../user/interface/user.interface';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { Public } from '../auth/jwt';

@Controller('notifications')
@Public()
export class NotificationGatewayController {
    constructor(
        @Inject(KAFKA_CLIENTS.NOTIFICATION) private notificationClient: ClientProxy,
    ) { }
}

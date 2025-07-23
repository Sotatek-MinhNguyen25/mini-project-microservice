import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { KAFKA_CLIENTS } from '../../constants/app.constants';
import { Public } from '../auth/jwt';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../../common/roles/role.enum';

@Controller('notifications')
@Public()
@Roles(Role.ADMIN)
export class NotificationGatewayController {
  constructor(@Inject(KAFKA_CLIENTS.NOTIFICATION) private notificationClient: ClientProxy) {}
}

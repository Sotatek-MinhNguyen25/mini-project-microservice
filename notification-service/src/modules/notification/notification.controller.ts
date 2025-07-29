import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CONSTANTS } from 'src/common/constant';
import {
  CreateDto,
  FindAllQueryDto,
  UpdateAllDto,
  UpdateOneDto,
} from './dto/notification.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.FIND_ALL)
  findAll(@Payload() findAllQueryDto: FindAllQueryDto) {
    return this.notificationService.findAll(findAllQueryDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.UPDATE_ONE)
  updateOne(@Payload() updateOneDto: UpdateOneDto) {
    return this.notificationService.updateOne(updateOneDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.UPDATE_ONE)
  updateAll(@Payload() updateAllDto: UpdateAllDto) {
    return this.notificationService.updateAll(updateAllDto);
  }

  @EventPattern(CONSTANTS.MESSAGE_PATTERN.NOTIFICATION.CREATE)
  create(@Payload() createDto: CreateDto) {
    this.notificationService.create(createDto);
  }
}

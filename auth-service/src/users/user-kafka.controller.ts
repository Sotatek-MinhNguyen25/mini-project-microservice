import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KAFKA_PATTERNS } from 'src/auth/kafka.patterns';
import { GetListUserDto } from './dto/get-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserByIdsDto } from './dto/find-user-ids.dto';

@Controller()
export class UserKafkaController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(KAFKA_PATTERNS.USER_CREATE)
  async createUser(@Payload() data: CreateUserDto) {
    return await this.userService.createUser(data);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_FIND_ONE)
  async findUserById(@Payload() payload: string) {
    return await this.userService.findOneUser(payload);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_FIND_IDS)
  async findUsersByIds(@Payload() dto: FindUserByIdsDto) {
    console.log(dto);
    return await this.userService.findUserByIds(dto);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_FIND_MANY)
  async findListsUser(@Payload() data: GetListUserDto) {
    return await this.userService.findListsUser(data);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_UPDATE)
  async updateUser(@Payload() data: UpdateUserDto) {
    return await this.userService.updateUser(data);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_DELETE)
  async deleteUser(@Payload() payload: string) {
    console.log(payload);
    return await this.userService.deleteUser(payload);
  }

  @MessagePattern(KAFKA_PATTERNS.USER_DETAIL_GET)
  async getMe(@Payload() payload: any) {
    return await this.userService.getMe(payload);
  }
}

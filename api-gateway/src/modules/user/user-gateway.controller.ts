import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { GetListUserDto } from './dto/get-list.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';
import { FindUsersByIdsDto } from './dto/find-user-ids.dto';
import { dot } from 'node:test/reporters';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserGatewayController {
  constructor(@Inject(KAFKA_CLIENTS.AUTH) private readonly client: ClientKafka) { }

  async onModuleInit() {
    this.client.subscribeToResponseOf(KAFKA_PATTERNS.USER.CREATE);
    this.client.subscribeToResponseOf(KAFKA_PATTERNS.USER.FIND_ONE);
    this.client.subscribeToResponseOf(KAFKA_PATTERNS.USER.FIND_MANY);
    this.client.subscribeToResponseOf(KAFKA_PATTERNS.USER.FIND_IDS);
    this.client.subscribeToResponseOf(KAFKA_PATTERNS.USER.UPDATE);

    await this.client.connect()
  }

  @Get()
  async getUsers(@Query() dto: GetListUserDto) {
    return await firstValueFrom(this.client.send(KAFKA_PATTERNS.USER.FIND_MANY, instanceToPlain(dto)));
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await firstValueFrom(this.client.send(KAFKA_PATTERNS.USER.FIND_ONE, id));
  }

  @Post('find-by-ids')
  async findUsersByIds(@Body() body: FindUsersByIdsDto) {
    return await firstValueFrom(this.client.send(KAFKA_PATTERNS.USER.FIND_IDS, instanceToPlain(body)));
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return await firstValueFrom(this.client.send(KAFKA_PATTERNS.USER.CREATE, instanceToPlain(dto)));
  }

  @Patch(":id")
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data = { ...body, id }
    return await firstValueFrom(this.client.send(KAFKA_PATTERNS.USER.UPDATE, data));
  }
}

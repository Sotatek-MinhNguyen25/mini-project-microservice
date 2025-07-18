import { Body, Controller, Get, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { Public } from '../auth/jwt';
import { ApiBody } from '@nestjs/swagger';
import { CreateTagDto } from '../post/dto/create-tag.dto';
import { firstValueFrom } from 'rxjs';

@Controller('tag')
export class TagGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.POST) private readonly postClient: ClientKafka) {}
  async onModuleInit() {
    // Tag
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.TAG.CREATE);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.TAG.GET);
  }
  // Tag
  @Public()
  @Post('')
  @ApiBody({ type: CreateTagDto })
  async createTag(@Body() createTagDto: CreateTagDto) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.TAG.CREATE, { ...createTagDto }));
  }

  @Public()
  @Get('')
  async getTag() {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.TAG.GET, {}));
  }
}

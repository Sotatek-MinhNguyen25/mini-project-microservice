<<<<<<< HEAD
import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
} from '@nestjs/common';
=======
import { Body, Controller, Get, Inject, OnModuleInit, Post } from '@nestjs/common';
>>>>>>> f83938fd35d62d17735828a71b8d4965c470a703
import { Public } from '../auth/jwt';
import { config } from 'src/configs/config.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/CreatePostDto';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';

@Controller('post')
export class PostGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.POST) private readonly postClient: ClientKafka) {}

  async onModuleInit() {
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.CREATE);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.COMMENT);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET_DETAIL);
    await this.postClient.connect();
  }

  @Public()
  @Get('')
  async getPost() {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.GET, {}));
  }

  @Public()
  @Post('')
  async createPost(@Body() createPostDto: any) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.CREATE, { ...createPostDto }));
  }

  @Public()
  @Post('comment')
  async createComment(@Body() createCommentDto: any) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.COMMENT, {
        ...createCommentDto,
      }),
    );
  }
  @Public()
  @Get(':id')
  async getDetailPost(@Param('id') id: string) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.GET_DETAIL, id),
    );
  }
}

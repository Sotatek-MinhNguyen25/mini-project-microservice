import { Body, Controller, Get, Inject, OnModuleInit, Param, Post } from '@nestjs/common';
import { Public } from '../auth/jwt';
import { config } from 'src/configs/config.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/create-post.dto';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { ApiBody } from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Controller('post')
export class PostGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.POST) private readonly postClient: ClientKafka) {}

  async onModuleInit() {
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.CREATE);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.COMMENT);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET_DETAIL);

    // Tag
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.TAG.CREATE);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.TAG.GET);

    // Reaction
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.REACTION.CREATE);
    await this.postClient.connect();
  }

  @Public()
  @Get('')
  async getPost() {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.GET, {}));
  }

  @Public()
  @Post('')
  @ApiBody({ type: CreatePostDto })
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.CREATE, { ...createPostDto }));
  }

  @Public()
  @Post('comment')
  @ApiBody({ type: CreateCommentDto })
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.COMMENT, {
        ...createCommentDto,
      }),
    );
  }
  @Public()
  @Get(':id')
  async getDetailPost(@Param('id') id: string) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.GET_DETAIL, id));
  }

  // Reaction
  @Public()
  @Post('reaction')
  @ApiBody({ type: CreateReactionDto })
  async createReaction(@Body() createReactionDto: CreateReactionDto) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.REACTION.CREATE, { ...createReactionDto }));
  }
}

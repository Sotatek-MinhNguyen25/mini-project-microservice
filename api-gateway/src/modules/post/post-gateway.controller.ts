import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Query } from '@nestjs/common';
import { Public } from '../auth/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/create-post.dto';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { AuthUser } from 'src/common/decorator/auth-user.decorator';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';

@Controller('post')
export class PostGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.POST) private readonly postClient: ClientKafka) {}

  async onModuleInit() {
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.CREATE);
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.GET_DETAIL);

    // Reaction
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.REACTION.CREATE);

    await this.postClient.connect();
  }

  @Public()
  @Get('')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getPost(@Query() postQueryDto: PostQueryDto) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.GET, { ...postQueryDto }));
  }

  @Post('')
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  async createPost(@AuthUser() user: JwtPayload, @Body() createPostDto: CreatePostDto) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.CREATE, { ...createPostDto, userId: user.sub }),
    );
  }

  @ApiBearerAuth()
  @Get(':id')
  async getDetailPost(@Param('id') id: string) {
    return await firstValueFrom(this.postClient.send(KAFKA_PATTERNS.POST.GET_DETAIL, id));
  }

  // Reaction
  @ApiBearerAuth()
  @Post('reaction')
  @ApiBody({ type: CreateReactionDto })
  async createReaction(@AuthUser() user: JwtPayload, @Body() createReactionDto: CreateReactionDto) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.REACTION.CREATE, { ...createReactionDto, userId: user.sub }),
    );
  }
}

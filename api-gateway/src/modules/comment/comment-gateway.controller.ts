import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthUser } from 'src/common/decorator/auth-user.decorator';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { ChildCommentQueryDto } from './dto/comment.dto';

@Controller('comment')
export class CommentGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.POST) private readonly postClient: ClientKafka) {}

  async onModuleInit() {
    this.postClient.subscribeToResponseOf(KAFKA_PATTERNS.POST.COMMENT.CREATE);
    await this.postClient.connect();
  }

  @Post('')
  @ApiBearerAuth()
  @ApiBody({ type: CreateCommentDto })
  async createComment(@AuthUser() user: JwtPayload, @Body() createCommentDto: CreateCommentDto) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.COMMENT.CREATE, {
        ...createCommentDto,
        userId: user.sub,
      }),
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getChild(@AuthUser() user: JwtPayload, @Param('id') parentId: string, @Query() queryDto: ChildCommentQueryDto) {
    return await firstValueFrom(
      this.postClient.send(KAFKA_PATTERNS.POST.COMMENT.GET_CHILD, {
        parentId: parentId,
        paginateParams: {
          page: queryDto.page,
          limit: queryDto.limit,
        },
      }),
    );
  }
}

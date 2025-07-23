import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthUser } from 'src/common/decorator/auth-user.decorator';
import { JwtPayload } from 'src/common/type/jwt-payload.type';

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
}

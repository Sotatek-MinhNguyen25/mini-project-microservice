import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { Public } from '../auth/jwt';
import { config } from 'src/configs/config.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('post')
export class PostGatewayController implements OnModuleInit {
  constructor(
    @Inject(config.POST_SERVICE_NAME) private readonly postClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.postClient.subscribeToResponseOf('findAllPost');
    await this.postClient.connect();
  }

  @Public()
  @Get('')
  async getPost() {
    const data = await firstValueFrom(this.postClient.send('findAllPost', {}));
    return { data: data };
  }
}

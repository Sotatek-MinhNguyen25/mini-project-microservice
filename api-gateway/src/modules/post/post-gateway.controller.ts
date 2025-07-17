import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Query,
    Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { IUser } from '../user/interface/user.interface';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { Public } from '../auth/jwt';

@Controller('post')
@Public()
export class PostGatewayController {
    constructor(@Inject(KAFKA_CLIENTS.POST) private postClient: ClientProxy) { }

    @Post()
    async createPost(@Body() body: any, @AuthUser() user: IUser) {
        return firstValueFrom(
            this.postClient.send(KAFKA_PATTERNS.POST.CREATE, {
                ...body,
                userId: user.userId,
            }),
        );
    }

    @Get()
    async getPosts(@Query() query: any) {
        return firstValueFrom(
            this.postClient.send(KAFKA_PATTERNS.POST.LIST, query),
        );
    }

    @Get(':id')
    async getPost(@Param('id') id: string) {
        return firstValueFrom(
            this.postClient.send(KAFKA_PATTERNS.POST.GET, { id }),
        );
    }
}

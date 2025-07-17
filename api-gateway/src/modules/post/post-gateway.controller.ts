import {
    Body,
    Controller,
    Get,
    Inject,
    OnModuleInit,
    Post,
} from '@nestjs/common';
import { Public } from '../auth/jwt';
import { config } from 'src/configs/config.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/CreatePostDto';

@Controller('post')
export class PostGatewayController implements OnModuleInit {
    constructor(
        @Inject(config.POST_SERVICE_NAME) private readonly postClient: ClientKafka,
    ) { }

    async onModuleInit() {
        this.postClient.subscribeToResponseOf('findAllPost');
        this.postClient.subscribeToResponseOf('createPost');
        await this.postClient.connect();
    }

    @Public()
    @Get('')
    async getPost() {
        return await firstValueFrom(this.postClient.send('findAllPost', {}));
    }

    @Public()
    @Post('')
    async createPost(@Body() createPostDto: any) {
        console.log(1, createPostDto);
        return await firstValueFrom(
            this.postClient.send('createPost', { ...createPostDto }),
        );
    }
}
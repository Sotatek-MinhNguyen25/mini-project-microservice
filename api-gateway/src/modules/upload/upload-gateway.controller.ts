import {
    Controller,
    Inject,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { IUser } from '../user/interface/user.interface';

@Controller('upload')
export class UploadGatewayController {
    constructor(
        @Inject(KAFKA_CLIENTS.UPLOAD) private uploadClient: ClientProxy,
    ) { }

    @Post('file')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @AuthUser() user: IUser) {
        return firstValueFrom(
            this.uploadClient.send(KAFKA_PATTERNS.UPLOAD.FILE, {
                file: {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    buffer: file.buffer,
                },
                userId: user.userId,
            }),
        );
    }

    @Post('image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: any, @AuthUser() user: IUser) {
        return firstValueFrom(
            this.uploadClient.send(KAFKA_PATTERNS.UPLOAD.IMAGE, {
                file: {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    buffer: file.buffer,
                },
                userId: user.userId,
            }),
        );
    }
}

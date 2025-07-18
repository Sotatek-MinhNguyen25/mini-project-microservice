import { Controller, Inject, Post, UploadedFile, UseInterceptors, OnModuleInit, UploadedFiles } from '@nestjs/common';
import { FileInterceptor,FilesInterceptor  } from '@nestjs/platform-express';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { IUser } from '../user/interface/user.interface';
import { Public } from '../auth/jwt';

@Public()
@ApiTags('Upload')
@Controller('upload')
export class UploadGatewayHTTPController implements OnModuleInit {
  constructor(
    @Inject(KAFKA_CLIENTS.UPLOAD)
    private uploadClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.uploadClient.subscribeToResponseOf(`${KAFKA_PATTERNS.UPLOAD.FILE}`);
    this.uploadClient.subscribeToResponseOf(`${KAFKA_PATTERNS.UPLOAD.IMAGE}`);
    this.uploadClient.subscribeToResponseOf(`${KAFKA_PATTERNS.UPLOAD.IMAGES}`);
    console.log();
    await this.uploadClient.connect();
  }

  /**
   * Upload a single file
   */
  @Post('file')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @AuthUser() user: IUser) {
    const userId = this.getUserId(user);

    const response = await this.sendToKafka(KAFKA_PATTERNS.UPLOAD.FILE, {
      file: this.formatFile(file),
      userId,
    });

    return this.formatSingleFileResponse(response, 'File uploaded successfully');
  }

  /**
   * Upload a single image
   */
  @Post('image')
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: any, @AuthUser() user: IUser) {
    const userId = this.getUserId(user);

    const response = await this.sendToKafka(KAFKA_PATTERNS.UPLOAD.IMAGE, {
      file: this.formatFile(file),
      userId,
    });

    console.log('Response from Kafka:', response);

    return this.formatSingleFileResponse(response, 'Image uploaded successfully');
  }

  /**
   * Upload multiple files
   */
  @Post('files')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: any, @AuthUser() user: IUser) {
    const userId = this.getUserId(user);

    const response = await this.sendToKafka(KAFKA_PATTERNS.UPLOAD.IMAGES, {
      files: files.map(this.formatFile),
      userId,
    });

    console.log('Response from Kafka:', response);

    return this.formatMultipleFilesResponse(response, 'Files uploaded successfully');
  }

  /**
   * Upload multiple images
   */
  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(@UploadedFiles() files: any, @AuthUser() user: IUser) {
    const userId = this.getUserId(user);

    const response = await this.sendToKafka(KAFKA_PATTERNS.UPLOAD.IMAGES, {
      files: files.map(this.formatFile),
      userId,
    });

    return this.formatMultipleFilesResponse(response, 'Images uploaded successfully');
  }

  private formatFile(file: any) {
    return {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
  }

  private formatMultipleFilesResponse(response: any[], successMessage: string) {
    if (!Array.isArray(response)) {
      return {
        status: 'error',
        message: 'Upload failed or invalid response from service',
      };
    }

    return {
      status: 'success',
      message: successMessage,
      data: response.map((file) => ({
        url: file?.url,
        publicId: file?.publicId,
        resourceType: file?.resourceType,
        fileType: file?.fileType,
        fileName: file?.fileName,
      })),
    };
  }

  private sendToKafka(pattern: string, payload: any) {
    return firstValueFrom(this.uploadClient.send(pattern, payload));
  }

  private formatSingleFileResponse(response: any, successMessage: string) {
    if (response?.status !== 'success') {
      return {
        status: 'error',
        message: response?.message || 'Upload failed',
      };
    }

    return {
      status: 'success',
      message: successMessage,
      data: {
        url: response?.url,
        publicId: response?.publicId,
        resourceType: response?.resourceType,
        fileType: response?.fileType,
        fileName: response?.fileName,
      },
    };
  }

  private getUserId(user: IUser): string {
    if (!user) {
      // Dummy user for Swagger / local test
      return 'dummy-user-id';
    }

    return user.userId;
  }
}

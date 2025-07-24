import { Controller, Post, Req, Inject, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { IUser } from '../user/interface/user.interface';
import { Public } from '../../common/jwt';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as formidable from 'formidable';
import * as fs from 'fs/promises';

@ApiTags('Upload')
@Public()
@Controller('upload')
export class UploadGatewayHTTPController {
  private readonly uploadServiceUrl: string;
  private readonly logger = new Logger(UploadGatewayHTTPController.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.uploadServiceUrl = this.configService.get<string>('UPLOAD_SERVICE_URL', 'http://127.0.0.1:3008/resources');
  }

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
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file uploaded or invalid file' })
  async uploadFile(@Req() req: Request, @AuthUser() user: IUser) {
    const file = await this.parseSingleFile(req, 'file');
    return this.uploadSingleFile(file, user, 'file');
  }

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
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No image uploaded or invalid image' })
  async uploadImage(@Req() req: Request, @AuthUser() user: IUser) {
    const file = await this.parseSingleFile(req, 'image');
    return this.uploadSingleFile(file, user, 'file');
  }

  @Post('files')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No files uploaded or invalid files' })
  async uploadFiles(@Req() req: Request, @AuthUser() user: IUser) {
    const files = await this.parseMultipleFiles(req, 'files');
    return this.uploadMultipleFiles(files, user, 'files');
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No images uploaded or invalid images' })
  async uploadImages(@Req() req: Request, @AuthUser() user: IUser) {
    const files = await this.parseMultipleFiles(req, 'images');
    return this.uploadMultipleFiles(files, user, 'files');
  }

  private async parseSingleFile(req: Request, fieldName: string): Promise<formidable.File & { buffer: Buffer }> {
    const form = new formidable.IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      allowEmptyFiles: false,
      minFileSize: 1,
      maxTotalFileSize: 100 * 1024 * 1024,
    });
    const { files } = await this.parseFormData(form, req);
    this.logger.debug(
      `Parsed files for ${fieldName}: ${JSON.stringify(files, (key, value) => (key === 'buffer' ? '[Buffer]' : value))}`,
    );
    const file = files[fieldName]?.[0];
    if (!file) {
      throw new BadRequestException(`No file uploaded for field: ${fieldName}`);
    }
    try {
      // Ensure file has a buffer
      if (!file.buffer && file.filepath) {
        file.buffer = await fs.readFile(file.filepath);
        this.logger.debug(`Read file buffer for ${fieldName}: ${file.originalname}, size: ${file.buffer.length}`);
        // Clean up temporary file
        await fs
          .unlink(file.filepath)
          .catch((err) => this.logger.warn(`Failed to delete temp file ${file.filepath}: ${err.message}`));
      }
      if (!file.buffer) {
        throw new Error('File buffer could not be loaded');
      }
      return file as formidable.File & { buffer: Buffer };
    } catch (err) {
      this.logger.error(`Failed to read file for ${fieldName}: ${err.message}`);
      throw new BadRequestException(`Invalid file provided for field: ${fieldName}`);
    }
  }

  private async parseMultipleFiles(req: Request, fieldName: string): Promise<(formidable.File & { buffer: Buffer })[]> {
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      allowEmptyFiles: false,
      minFileSize: 1,
      maxTotalFileSize: 100 * 1024 * 1024,
    });
    const { files } = await this.parseFormData(form, req);
    this.logger.debug(
      `Parsed files for ${fieldName}: ${JSON.stringify(files, (key, value) => (key === 'buffer' ? '[Buffer]' : value))}`,
    );
    const fileArray = files[fieldName];
    if (!fileArray || fileArray.length === 0) {
      throw new BadRequestException(`No files uploaded for field: ${fieldName}`);
    }
    try {
      for (const file of fileArray) {
        if (!file.buffer && file.filepath) {
          file.buffer = await fs.readFile(file.filepath);
          this.logger.debug(`Read file buffer for ${fieldName}: ${file.originalname}, size: ${file.buffer.length}`);
          await fs
            .unlink(file.filepath)
            .catch((err) => this.logger.warn(`Failed to delete temp file ${file.filepath}: ${err.message}`));
        }
        if (!file.buffer) {
          throw new Error(`File buffer could not be loaded for ${file.originalname}`);
        }
      }
      return fileArray as (formidable.File & { buffer: Buffer })[];
    } catch (err) {
      this.logger.error(`Failed to read files for ${fieldName}: ${err.message}`);
      throw new BadRequestException(`Invalid files provided for field: ${fieldName}`);
    }
  }

  private parseFormData(
    form: InstanceType<typeof formidable.IncomingForm>,
    req: Request,
  ): Promise<{ fields: any; files: any }> {
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          this.logger.error(`Form parsing error: ${err.message}`);
          reject(new BadRequestException('Failed to parse form data'));
        } else {
          resolve({ fields, files });
        }
      });
    });
  }

  private async uploadSingleFile(file: formidable.File & { buffer: Buffer }, user: IUser, field: string) {
    const formData = this.buildFormData([{ field, file }]);
    const response = await this.httpPost(`${this.uploadServiceUrl}/upload`, formData);
    console.log('Upload Service Raw Response:', response?.data);
    return {
      data: response.data,
      message: `File uploaded successfully`,
    };
  }

  private async uploadMultipleFiles(files: (formidable.File & { buffer: Buffer })[], user: IUser, field: string) {
    const formData = this.buildFormData(files.map((file) => ({ field, file })));
    const response = await this.httpPost(`${this.uploadServiceUrl}/upload-multiple`, formData);
    return {
      data: response.data,
      message: `Files uploaded successfully`,
    };
  }

  private async httpPost(url: string, formData: any): Promise<AxiosResponse<any>> {
    return firstValueFrom(
      this.httpService.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }),
    );
  }

  private buildFormData(files: { field: string; file: formidable.File & { buffer: Buffer } }[]): any {
    const FormData = require('form-data');
    const formData = new FormData();
    files.forEach(({ field, file }) => {
      if (!file || !file.buffer) {
        this.logger.error(`Invalid file for field: ${field}`);
        throw new BadRequestException(`Invalid file provided for field: ${field}`);
      }
      formData.append(field, file.buffer, {
        filename: file.originalFilename,
        contentType: file.mimetype,
      });
    });
    return formData;
  }
}

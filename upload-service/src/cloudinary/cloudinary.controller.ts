import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryResponse } from './cloudinary-response';

@Controller('resources')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CloudinaryResponse> {
    return this.cloudinaryService.uploadFile(file);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    return this.cloudinaryService.uploadFiles(files);
  }
}

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { KAFKA_PATTERNS } from '../constants/app.constants';

@Controller()
export class CloudinaryKafkaController {
  private readonly logger = new Logger(CloudinaryKafkaController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  private normalizeFile(file: any): Express.Multer.File {
    return {
      ...file,
      buffer: Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Array.isArray(file.buffer?.data)
          ? Buffer.from(file.buffer.data)
          : Buffer.from(file.buffer, 'base64'),
    };
  }

  private normalizeFiles(files: any[]): Express.Multer.File[] {
    return files.map((file) => this.normalizeFile(file));
  }

  @MessagePattern(KAFKA_PATTERNS.UPLOAD.FILE)
  async handleFileUpload(@Payload() data: { file: any; userId: string }) {
    this.logger.log(`Processing single file upload for user ${data.userId}`);

    try {
      const file = this.normalizeFile(data.file);

      const result = await this.cloudinaryService.uploadFile(file);
      this.logger.log(`File uploaded successfully: ${result.url}`);

      return {
        status: 'success',
        url: result.url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        fileType: result.fileType,
        fileName: result.fileName,
        userId: data.userId,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }

  @MessagePattern(KAFKA_PATTERNS.UPLOAD.IMAGE)
  async handleImageUpload(@Payload() data: { file: any; userId: string }) {
    this.logger.log(`Processing image upload for user ${data.userId}`);

    try {
      const file = this.normalizeFile(data.file);

      const result = await this.cloudinaryService.uploadFile(file);
      this.logger.log(`Image uploaded successfully: ${result.url}`);
      if (!result) {
        throw new Error('Image upload failed');
      }

      return {
        status: 'success',
        url: result.url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        fileType: result.fileType,
        fileName: result.fileName,
        userId: data.userId,
      };
    } catch (error) {
      this.logger.error(`Image upload failed: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }

  @MessagePattern(KAFKA_PATTERNS.UPLOAD.FILES)
  async handleFilesUpload(@Payload() data: { files: any[]; userId: string }) {
    this.logger.log(`Processing multiple files upload for user ${data.userId}`);

    try {
      const files = this.normalizeFiles(data.files);

      const result = await this.cloudinaryService.uploadFiles(files);
      this.logger.log(
        `Files uploaded successfully: ${result.map((file) => file.url).join(', ')}`,
      );

      return {
        status: 'success',
        files: result.map((file) => ({
          url: file.url,
          publicId: file.public_id,
          resourceType: file.resource_type,
          fileType: file.fileType,
          fileName: file.fileName,
        })),
        userId: data.userId,
      };
    } catch (error) {
      this.logger.error(
        `Multiple files upload failed: ${error.message}`,
        error.stack,
      );
      return { status: 'error', message: error.message };
    }
  }

  @MessagePattern(KAFKA_PATTERNS.UPLOAD.IMAGES)
  async handleImagesUpload(@Payload() data: { files: any[]; userId: string }) {
    this.logger.log(
      `Processing multiple images upload for user ${data.userId}`,
    );

    try {
      const files = this.normalizeFiles(data.files);

      const result = await this.cloudinaryService.uploadFiles(files);
      this.logger.log(
        `Images uploaded successfully: ${result.map((file) => file.url).join(', ')}`,
      );

      return {
        status: 'success',
        files: result.map((file) => ({
          url: file.url,
          publicId: file.public_id,
          resourceType: file.resource_type,
          fileType: file.fileType,
          fileName: file.fileName,
        })),
        userId: data.userId,
      };
    } catch (error) {
      this.logger.error(
        `Multiple images upload failed: ${error.message}`,
        error.stack,
      );
      return { status: 'error', message: error.message };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { CloudinaryValidator } from './cloudinary.validator';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // milliseconds

  async uploadFile(
    file: Express.Multer.File,
    retries = 0,
  ): Promise<CloudinaryResponse> {
    try {
      CloudinaryValidator.validateFile(file);
      this.logger.log(`Uploading file: ${file.originalname}`);

      return await new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: file.mimetype.startsWith('video')
              ? 'video'
              : 'image',
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
              fileType: file.mimetype,
              fileName: file.originalname,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(
        `Upload failed for ${file.originalname}: ${error.message}`,
      );

      if (this.isTransientError(error) && retries < this.MAX_RETRIES) {
        this.logger.warn(
          `Retrying upload for ${file.originalname}, attempt ${retries + 1}`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.uploadFile(file, retries + 1);
      }

      const customError = new Error(
        `Failed to upload ${file.originalname}: ${error.message}`,
      );
      Object.assign(customError, { code: error.code || 'UPLOAD_FAILED' });
      throw customError;
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    this.logger.log(`Uploading ${files.length} files`);

    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  private isTransientError(error: any): boolean {
    const transientCodes = ['ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', '420'];
    return (
      transientCodes.includes(error.code) || error.message.includes('timeout')
    );
  }
}

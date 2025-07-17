import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { CloudinaryValidator } from './cloudinary.validator';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    CloudinaryValidator.validateFile(file);

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: file.mimetype.startsWith('video') ? 'video' : 'image' },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
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
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }
}
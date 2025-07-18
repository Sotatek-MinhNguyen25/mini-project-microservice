import { BadRequestException } from '@nestjs/common';

export class CloudinaryValidator {
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
  ];
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/webm',
  ];
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  static validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Unsupported file type. Only images (JPEG, PNG, GIF) and videos (MP4, MPEG, WEBM) are allowed',
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 100MB limit');
    }
  }
}

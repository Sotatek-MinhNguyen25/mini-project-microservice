import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ example: 'example.png' })
  originalname: string;

  @ApiProperty({ example: 'image/png' })
  mimetype: string;

  @ApiProperty({ example: 102400 })
  size: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  buffer: any;
}

export class UploadFilesDto {
  @ApiProperty({ type: [UploadFileDto] })
  files: UploadFileDto[];

  @ApiProperty({ example: 'userId123' })
  userId: string;
}

export class UploadSingleFileRequestDto {
  @ApiProperty({ type: UploadFileDto })
  file: UploadFileDto;

  @ApiProperty({ example: 'userId123' })
  userId: string;
}

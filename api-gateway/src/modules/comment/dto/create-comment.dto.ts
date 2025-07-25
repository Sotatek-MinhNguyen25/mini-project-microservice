import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  commentId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  postId?: string;
}

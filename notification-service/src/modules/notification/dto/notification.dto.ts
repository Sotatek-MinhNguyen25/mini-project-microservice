import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class FindAllQueryDto {
  @IsUUID()
  userId: string;

  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  limit: number;
}

export class UpdateOneDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  notificationId: string;
}

export class UpdateAllDto {
  @IsUUID()
  userId: string;
}

export class CreateDto {
  @IsUUID()
  receiverId: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  postId: string;

  @IsString()
  type: string;

  @IsString()
  content: string;
}

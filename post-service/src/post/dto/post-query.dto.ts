import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class PostQueryDto {
  @IsString()
  search: string;

  @IsString()
  tags: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number = 10;

  @IsUUID()
  @IsOptional()
  userId?: string;
}

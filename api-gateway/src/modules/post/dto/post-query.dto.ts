import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PostQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  tags: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

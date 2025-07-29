import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class NotiQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Optional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Optional()
  limit: number = 5;
}

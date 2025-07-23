import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OAuthProvider, Role, UserStatus } from '../enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetListUserDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (username hoặc email)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ default: 'createdAt', description: 'Trường sắp xếp' })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC, description: 'Thứ tự sắp xếp' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ enum: Role, description: 'Lọc theo vai trò' })
  @IsOptional()
  @IsEnum(Role, { each: true })
  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  roles?: Role[];

  @ApiPropertyOptional({ enum: UserStatus, description: 'Lọc theo trạng thái tài khoản' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: OAuthProvider, description: 'Lọc theo oauth' })
  @IsOptional()
  @IsEnum(OAuthProvider)
  oauthProvider?: OAuthProvider;
}

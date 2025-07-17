import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetListDto {
    @ApiPropertyOptional({ description: 'Từ khoá tìm kiếm' })
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

    @ApiPropertyOptional({ example: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}

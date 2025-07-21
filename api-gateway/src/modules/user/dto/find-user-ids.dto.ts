import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class FindUsersByIdsDto {
    @ApiProperty()
    @IsArray()
    @IsUUID(undefined, { each: true })
    ids: string[]
}
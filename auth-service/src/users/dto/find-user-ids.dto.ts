import { IsArray, IsUUID } from "class-validator";

export class FindUserByIdsDto {
    @IsArray()
    @IsUUID(undefined, { each: true })
    ids: string[]
}
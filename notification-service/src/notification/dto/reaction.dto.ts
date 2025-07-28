import { IsString, IsUUID } from 'class-validator';

export class ReactionDto {
  // @IsUUID()
  // userId: string;

  @IsUUID()
  postId: string;

  @IsUUID()
  from: string;

  @IsUUID()
  to: string;

  @IsString()
  type: string;
}

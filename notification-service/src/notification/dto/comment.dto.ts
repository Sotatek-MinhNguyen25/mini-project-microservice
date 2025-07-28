import { IsOptional, IsUUID } from 'class-validator';

export class CommentEventDto {
  @IsUUID()
  postId: string;

  @IsUUID()
  from: string;

  @IsUUID()
  to: string;
}

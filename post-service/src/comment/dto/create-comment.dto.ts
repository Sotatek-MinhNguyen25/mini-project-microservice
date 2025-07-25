import { IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  postId?: string;

  @IsUUID()
  commentId?: string;
}

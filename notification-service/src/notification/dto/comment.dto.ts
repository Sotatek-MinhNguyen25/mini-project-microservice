import { IsUUID } from 'class-validator';

export class ReplyCommentDto {
  @IsUUID()
  commentId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  to: string;
}

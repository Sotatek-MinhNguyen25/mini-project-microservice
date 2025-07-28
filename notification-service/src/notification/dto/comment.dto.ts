import { IsObject, IsUUID } from 'class-validator';

export class CommentEventDto {
  @IsUUID()
  postId: string;

  @IsObject()
  from: any;

  @IsUUID()
  to: string;
}

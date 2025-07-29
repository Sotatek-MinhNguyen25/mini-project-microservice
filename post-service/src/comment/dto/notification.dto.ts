import { IsString, IsUUID } from 'class-validator';

export class CreateNotiDto {
  @IsUUID()
  receiverId: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  postId: string;

  @IsString()
  type: string;

  @IsString()
  content: string;
}

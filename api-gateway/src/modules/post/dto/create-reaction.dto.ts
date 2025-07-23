import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

export class CreateReactionDto {
  @ApiProperty()
  @IsUUID()
  postId: string;

  @ApiProperty({ enum: ReactionType })
  @IsEnum(ReactionType)
  type: ReactionType;
}

import { ReactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;
}

export class UpdateReactionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;
}

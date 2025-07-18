import { ReactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
<<<<<<< HEAD
// import { ReactionType } from 'src/generated/prisma/client';
=======
import { ReactionType } from '@prisma/client';
>>>>>>> f83938fd35d62d17735828a71b8d4965c470a703

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

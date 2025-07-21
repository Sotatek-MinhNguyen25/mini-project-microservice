import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role, UserStatus, OAuthProvider } from '@prisma/client';

export class UpdateUserDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(OAuthProvider)
  oauthProvider?: OAuthProvider;
}

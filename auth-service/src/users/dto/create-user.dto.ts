import {
    IsEmail,
    IsString,
    IsEnum,
    IsOptional,
    IsArray,
    MinLength,
} from 'class-validator';
import { Role, UserStatus, OAuthProvider } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

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

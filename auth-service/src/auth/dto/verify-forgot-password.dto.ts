import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}

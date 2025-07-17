import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyRegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}

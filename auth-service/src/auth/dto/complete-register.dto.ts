import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class CompleteRegisterDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  otp: string

  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}

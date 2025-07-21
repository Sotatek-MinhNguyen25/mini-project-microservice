import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CompleteRegisterDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email for completing registration',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP from email',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'testuser',
    description: 'Username for the new account',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: '123456',
    description: 'Password for the new account',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

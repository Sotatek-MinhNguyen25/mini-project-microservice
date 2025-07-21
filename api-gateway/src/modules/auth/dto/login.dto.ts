import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email for login',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Password for login',
    minLength: 6,
  })
  @IsNotEmpty()
  password: string;
}

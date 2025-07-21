import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email for registration',
  })
  @IsEmail()
  email: string;
}

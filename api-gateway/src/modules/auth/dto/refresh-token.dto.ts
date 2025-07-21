import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your-refresh-token',
    description: 'The refresh token',
  })
  @IsNotEmpty()
  refreshToken: string;
}

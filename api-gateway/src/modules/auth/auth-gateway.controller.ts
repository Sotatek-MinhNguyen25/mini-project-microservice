import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './jwt/jwt.decorator';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
@Public()
export class AuthGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.AUTH) private readonly authClient: ClientKafka) {}

  onModuleInit() {
    const authPatterns = Object.values(KAFKA_PATTERNS.AUTH);
    for (const pattern of authPatterns) {
      this.authClient.subscribeToResponseOf(pattern);
    }
  }

  @Post('send-register-otp')
  @ApiOperation({ summary: 'Send OTP for registration' })
  @ApiBody({ type: RegisterDto })
  async sendRegisterOtp(@Body() body: RegisterDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.REGISTER, { ...body }));
  }

  @Post('register')
  @ApiOperation({ summary: 'Complete registration with OTP' })
  @ApiBody({ type: CompleteRegisterDto })
  async completeRegister(@Body() body: CompleteRegisterDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.COMPLETE_REGISTER, { ...body }));
  }

  @Post('login')
  @ApiOperation({ summary: 'Login to the system' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.LOGIN, body));
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.REFRESH_TOKEN, body));
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for forgot password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'test@gmail.com',
        },
      },
    },
  })
  async forgotPassword(@Body() body: any) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.FORGOT_PASSWORD, body));
  }

  @Post('verify-forgot-password')
  @ApiOperation({ summary: 'Verify OTP for forgot password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'test@gmail.com',
        },
        otp: {
          type: 'string',
          example: '123456',
        },
      },
    },
  })
  async verifyForgotPassword(@Body() body: any) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.VERIFY_FORGOT_PASSWORD, body));
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update password after OTP verification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'test@gmail.com',
        },
        otp: {
          type: 'string',
          example: '123456',
        },
        newPassword: {
          type: 'string',
          example: 'newPassword123',
        },
      },
    },
  })
  async updatePassword(@Body() body: any) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.UPDATE_PASSWORD, body));
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout from the current session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'your-access-token',
        },
      },
    },
  })
  async logout(@Body() body: { accessToken: string }) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.LOGOUT, body));
  }
}

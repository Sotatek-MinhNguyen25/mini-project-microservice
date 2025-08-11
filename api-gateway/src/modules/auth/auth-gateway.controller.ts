import { Body, Controller, Inject, OnModuleInit, Post, Get } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto, VerifyForgotPasswordDto, UpdatePasswordDto } from '../../common/dto/forgot-password.dto';
import { Public, Protected } from '../../common/jwt';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../common/decorator/auth-user.decorator';
import { JwtPayload } from '../../common/type/jwt-payload.type';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Public()
@Controller('auth')
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
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.LOGIN, { ...body }));
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.REFRESH_TOKEN, { ...body }));
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.FORGOT_PASSWORD, { ...body }));
  }

  @Post('verify-forgot-password')
  @ApiOperation({ summary: 'Verify OTP for forgot password' })
  @ApiBody({ type: VerifyForgotPasswordDto })
  async verifyForgotPassword(@Body() body: VerifyForgotPasswordDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.VERIFY_FORGOT_PASSWORD, { ...body }));
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update password after OTP verification' })
  @ApiBody({ type: UpdatePasswordDto })
  async updatePassword(@Body() body: UpdatePasswordDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.UPDATE_PASSWORD, { ...body }));
  }

  @ApiBearerAuth()
  @Protected()
  @Post('logout')
  @ApiOperation({ summary: 'Logout from all sessions' })
  async logout(@AuthUser() user: JwtPayload) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.LOGOUT, { userId: user.sub }));
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test for auth module' })
  getSmokeTest() {
    return {
      status: 'success',
      message: 'Auth Gateway module is running',
      timestamp: new Date().toISOString(),
      module: 'auth-gateway',
    };
  }
}

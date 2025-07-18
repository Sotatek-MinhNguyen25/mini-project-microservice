import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiResponseOk } from '../shared/decorators/response.decorator';
import { RESPONSE_MESSAGE } from '../shared/message/response.message';
import { KAFKA_PATTERNS } from './kafka.patterns';

@Controller()
export class AuthKafkaController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(KAFKA_PATTERNS.REGISTER)
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async register(@Payload() data: RegisterDto) {
    return this.authService.sendRegisterOtp(data);
  }

  @MessagePattern(KAFKA_PATTERNS.LOGIN)
  @ApiResponseOk(RESPONSE_MESSAGE.LOGIN_SUCCESS)
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern(KAFKA_PATTERNS.REFRESH_TOKEN)
  @ApiResponseOk(RESPONSE_MESSAGE.REFRESH_SUCCESS)
  async refreshToken(@Payload() data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @MessagePattern(KAFKA_PATTERNS.LOGOUT)
  @ApiResponseOk(RESPONSE_MESSAGE.LOGOUT_SUCCESS)
  async logout(@Payload() data: { accessToken: string }) {
    return this.authService.logout(data.accessToken);
  }

  @MessagePattern(KAFKA_PATTERNS.FORGOT_PASSWORD)
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async forgotPassword(@Payload() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @MessagePattern(KAFKA_PATTERNS.VERIFY_FORGOT_PASSWORD)
  @ApiResponseOk(RESPONSE_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS)
  async verifyForgotPassword(@Payload() data: VerifyForgotPasswordDto) {
    return this.authService.verifyForgotPassword(data);
  }

  @MessagePattern(KAFKA_PATTERNS.UPDATE_PASSWORD)
  @ApiResponseOk(RESPONSE_MESSAGE.UPDATE_PASSWORD_SUCCESS)
  async updatePassword(@Payload() data: UpdatePasswordDto) {
    return this.authService.updatePassword(data);
  }

  // Nếu có check-user
  // @MessagePattern(KAFKA_PATTERNS.CHECK_USER)
  // @ApiResponseOk('Check user thành công')
  // async checkUser(@Payload() data: { email: string }) {
  //   return this.authService.checkUser(data.email);
  // }
}

import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiResponseOk } from '../shared/decorators/response.decorator';
import { RESPONSE_MESSAGE } from '../shared/message/response.message';
import { KAFKA_PATTERNS } from './kafka.patterns';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

@Controller()
@UsePipes(new ValidationPipe())
export class AuthKafkaController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern(KAFKA_PATTERNS.REGISTER)
  @ApiResponseOk(RESPONSE_MESSAGE.REGISTER_SUCCESS)
  async register(@Payload() data: RegisterDto) {
    return this.authService.sendRegisterOtp(data);
  }

  @MessagePattern(KAFKA_PATTERNS.COMPLETE_REGISTER)
  @ApiResponseOk(RESPONSE_MESSAGE.REGISTER_SUCCESS)
  async completeRegister(@Payload() data: CompleteRegisterDto) {
    return this.authService.completeRegister(data);
  }

  @MessagePattern(KAFKA_PATTERNS.LOGIN)
  @ApiResponseOk(RESPONSE_MESSAGE.LOGIN_SUCCESS)
  async login(@Payload() data: LoginDto) {
    console.log('[KafkaController] LOGIN payload:', data);
    return this.authService.login(data);
  }

  @MessagePattern(KAFKA_PATTERNS.REFRESH_TOKEN)
  @ApiResponseOk(RESPONSE_MESSAGE.REFRESH_SUCCESS)
  async refreshToken(@Payload() data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @MessagePattern(KAFKA_PATTERNS.LOGOUT)
  @ApiResponseOk(RESPONSE_MESSAGE.LOGOUT_SUCCESS)
  async logout(@Payload() data: { userId: string }) {
    return this.authService.logoutAllByUserId(data.userId);
  }

  /**
   * Gửi OTP quên mật khẩu về email (OTP sẽ được lưu trong Redis, TTL cấu hình qua env)
   */
  @MessagePattern(KAFKA_PATTERNS.FORGOT_PASSWORD)
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async forgotPassword(@Payload() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  /**
   * Xác thực OTP quên mật khẩu (OTP phải còn hạn và ở trạng thái CREATED)
   */
  @MessagePattern(KAFKA_PATTERNS.VERIFY_FORGOT_PASSWORD)
  @ApiResponseOk(RESPONSE_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS)
  async verifyForgotPassword(@Payload() data: VerifyForgotPasswordDto) {
    return this.authService.verifyForgotPassword(data);
  }

  /**
   * Đổi mật khẩu sau khi xác thực OTP quên mật khẩu (OTP phải ở trạng thái VERIFIED)
   */
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

  @MessagePattern(KAFKA_PATTERNS.VERIFY_TOKEN)
  async verifyToken(@Payload() data: { token: string }) {
    console.log(data)
    return await this.authService.verifyToken(data.token)
  }
}

import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiResponseOk } from '../shared/decorators/response.decorator'
import { RegisterDto } from './dto/register.dto'
import { CompleteRegisterDto } from './dto/complete-register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ValidationPipe } from '../shared/pipes/validation.pipe'
import { RESPONSE_MESSAGE } from '../shared/message/response.message'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Gửi OTP đăng ký về email
   * @param dto - { email }
   * @returns { message, statusCode, data }
   */
  @Post('send-register-otp')
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async sendRegisterOtp(@Body() dto: RegisterDto) {
    return await this.authService.sendRegisterOtp(dto)
  }

  /**
   * Đăng ký tài khoản mới (bước 2)
   * @param dto - { email, otp, username, password }
   * @returns { message, statusCode, data }
   */
  @Post('register')
  @ApiResponseOk(RESPONSE_MESSAGE.REGISTER_SUCCESS)
  async completeRegister(@Body() dto: CompleteRegisterDto) {
    return await this.authService.completeRegister(dto)
  }

  /**
   * Đăng nhập vào hệ thống
   * @param dto - { email, password }
   * @returns { message, statusCode, data: JwtResponse }
   */
  @Post('login')
  @ApiResponseOk(RESPONSE_MESSAGE.LOGIN_SUCCESS)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto)
  }

  /**
   * Làm mới access token bằng refresh token
   * @param dto - { refreshToken }
   * @returns { message, statusCode, data: JwtResponse }
   */
  @Post('refresh-token')
  @ApiResponseOk(RESPONSE_MESSAGE.REFRESH_SUCCESS)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto)
  }

  /**
   * Đăng xuất (stateless, client tự xóa token)
   */
  @Post('logout')
  @ApiResponseOk(RESPONSE_MESSAGE.LOGOUT_SUCCESS)
  async logout() {
    return await this.authService.logout()
  }

  /**
   * Gửi OTP quên mật khẩu về email
   */
  @Post('forgot-password')
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto)
  }

  /**
   * Xác thực OTP quên mật khẩu
   */
  @Post('verify-forgot-password')
  @ApiResponseOk(RESPONSE_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS)
  async verifyForgotPassword(@Body() dto: VerifyForgotPasswordDto) {
    return await this.authService.verifyForgotPassword(dto)
  }

  /**
   * Đổi mật khẩu sau khi xác thực OTP quên mật khẩu
   */
  @Post('update-password')
  @ApiResponseOk(RESPONSE_MESSAGE.UPDATE_PASSWORD_SUCCESS)
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return await this.authService.updatePassword(dto)
  }
}

import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiResponseOk } from '../shared/decorators/response.decorator'
import { RegisterDto } from './dto/register.dto'
import { CompleteRegisterDto } from './dto/complete-register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ValidationPipe } from '../shared/pipes/validation.pipe'
import { RESPONSE_MESSAGE } from '../shared/message/response.message'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Gửi OTP đăng ký về email
   * @param dto - { email }
   * @returns { message, statusCode, data }
   */
  @Post('send-register-otp')
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async sendRegisterOtp(@Body() dto: RegisterDto) {
    return await this.authService.sendRegisterOtp(dto)
  }

  /**
   * Đăng ký tài khoản mới (bước 2)
   * @param dto - { email, otp, username, password }
   * @returns { message, statusCode, data }
   */
  @Post('register')
  @ApiResponseOk(RESPONSE_MESSAGE.REGISTER_SUCCESS)
  async completeRegister(@Body() dto: CompleteRegisterDto) {
    return await this.authService.completeRegister(dto)
  }

  /**
   * Đăng nhập vào hệ thống
   * @param dto - { email, password }
   * @returns { message, statusCode, data: JwtResponse }
   */
  @Post('login')
  @ApiResponseOk(RESPONSE_MESSAGE.LOGIN_SUCCESS)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto)
  }

  /**
   * Làm mới access token bằng refresh token
   * @param dto - { refreshToken }
   * @returns { message, statusCode, data: JwtResponse }
   */
  @Post('refresh-token')
  @ApiResponseOk(RESPONSE_MESSAGE.REFRESH_SUCCESS)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto)
  }

  /**
   * Đăng xuất khỏi phiên hiện tại (logout chỉ phiên/thiết bị hiện tại, không ảnh hưởng các phiên khác)
   *
   * Yêu cầu:
   * - Gửi accessToken hiện tại trong body: { accessToken: string }
   *
   * Xử lý:
   * - Backend sẽ decode accessToken, lấy jti và userId
   * - Xóa jti khỏi Redis và set của user (revoke token của phiên này)
   * - Các phiên khác vẫn giữ nguyên
   *
   * @returns { message, statusCode }
   */
  @Post('logout')
  @ApiResponseOk(RESPONSE_MESSAGE.LOGOUT_SUCCESS)
  async logout(@Body('accessToken') accessToken: string) {
    return await this.authService.logout(accessToken)
  }

  /**
   * Gửi OTP quên mật khẩu về email
   */
  @Post('forgot-password')
  @ApiResponseOk(RESPONSE_MESSAGE.FORGOT_PASSWORD_SUCCESS)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto)
  }

  /**
   * Xác thực OTP quên mật khẩu
   */
  @Post('verify-forgot-password')
  @ApiResponseOk(RESPONSE_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS)
  async verifyForgotPassword(@Body() dto: VerifyForgotPasswordDto) {
    return await this.authService.verifyForgotPassword(dto)
  }

  /**
   * Đổi mật khẩu sau khi xác thực OTP quên mật khẩu
   */
  @Post('update-password')
  @ApiResponseOk(RESPONSE_MESSAGE.UPDATE_PASSWORD_SUCCESS)
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return await this.authService.updatePassword(dto)
  }
}

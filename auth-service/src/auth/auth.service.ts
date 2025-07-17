import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyRegisterDto } from './dto/verify-register.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

import { ERROR_MESSAGE } from '../shared/message/error.message';
import { JwtService } from '../jwt/jwt.service';
import { JwtPayload } from '../shared/type/jwt.type';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { OTP_PURPOSE, USER_STATUS } from './auth.constant';
import { RedisService } from '../redis/redis.service';
import { AuthRepository } from 'src/auth/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  // Đã chuyển logic tạo token sang JwtService custom

  private async getUserByEmailOrThrow(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new BadRequestException(ERROR_MESSAGE.USER_NOT_FOUND);
    return user;
  }

  private checkOtpOrThrow(otpObj: any, otp: string) {
    if (!otpObj || otpObj.code !== otp) throw new BadRequestException(ERROR_MESSAGE.INVALID_OTP);
    if (otpObj.expiresAt < new Date()) throw new BadRequestException(ERROR_MESSAGE.OTP_EXPIRED);
  }

  async sendRegisterOtp(dto: RegisterDto) {
    const existed = await this.authRepository.findUserByEmail(dto.email);
    if (existed) throw new BadRequestException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    await this.authRepository.createOTP({
      userId: null,
      email: dto.email,
      purpose: OTP_PURPOSE.EMAIL_VERIFICATION,
    });
    return {};
  }

  async completeRegister(dto: CompleteRegisterDto) {
    const otp = await this.authRepository.findOTPByEmail(dto.email, OTP_PURPOSE.EMAIL_VERIFICATION);
    this.checkOtpOrThrow(otp!, dto.otp);
    const existed = await this.authRepository.findUserByEmail(dto.email);
    if (existed) throw new BadRequestException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    const user = await this.authRepository.createUser({
      email: dto.email,
      username: dto.username,
      password: dto.password,
      status: USER_STATUS.VERIFIED,
    });
    await this.authRepository.deleteOTP(otp!.id);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      username: user.username,
    };
    const { accessToken, expiresIn: accessTokenExpiresIn, jti: atJti } = this.jwtService.createAT(payload);
    const { refreshToken, expiresIn: refreshTokenExpiresIn, jti: rtJti } = this.jwtService.createRT(payload);
    // Lưu jti vào Redis
    await this.redisService.setJti(atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.setJti(rtJti, this.parseTTL(refreshTokenExpiresIn));
    await this.redisService.addJtiToUserSet(user.id, atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.addJtiToUserSet(user.id, rtJti, this.parseTTL(refreshTokenExpiresIn));
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
    if (!user.password || dto.password !== user.password) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_PASSWORD);
    }
    if (user.status !== USER_STATUS.VERIFIED) throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_VERIFIED);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      username: user.username,
    };
    const { accessToken, expiresIn: accessTokenExpiresIn, jti: atJti } = this.jwtService.createAT(payload);
    const { refreshToken, expiresIn: refreshTokenExpiresIn, jti: rtJti } = this.jwtService.createRT(payload);
    // Lưu jti vào Redis
    await this.redisService.setJti(atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.setJti(rtJti, this.parseTTL(refreshTokenExpiresIn));
    await this.redisService.addJtiToUserSet(user.id, atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.addJtiToUserSet(user.id, rtJti, this.parseTTL(refreshTokenExpiresIn));
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken);
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        username: user.username,
        jti: payload.jti,
      };
      const { accessToken, expiresIn: accessTokenExpiresIn } = this.jwtService.createAT(newPayload);
      const { refreshToken, expiresIn: refreshTokenExpiresIn } = this.jwtService.createRT(newPayload);
      return {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      };
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * Logout phiên hiện tại: nhận accessToken, decode lấy jti và userId, xóa khỏi Redis
   */
  async logout(accessToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken);
      //Đoạn này để debug
      if (!payload.jti) {
        throw new UnauthorizedException(ERROR_MESSAGE.TOKEN_MISSING_JTI);
      }
      await this.redisService.delJti(payload.jti);
      await this.redisService.removeJtiFromUserSet(payload.sub, payload.jti);
      return {};
    } catch (e) {
      return { message: 'Logout failed: ' + (e.message || e) };
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    await this.authRepository.createOTP({
      userId: user.id,
      purpose: OTP_PURPOSE.FORGOT_PASSWORD,
    });
    return {};
  }

  async verifyRegister(dto: VerifyRegisterDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(user.id, OTP_PURPOSE.EMAIL_VERIFICATION);
    this.checkOtpOrThrow(otp!, dto.otp);
    await this.authRepository.updateUser(user.id, {
      status: USER_STATUS.VERIFIED,
    });
    return {};
  }

  async verifyForgotPassword(dto: VerifyForgotPasswordDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(user.id, OTP_PURPOSE.FORGOT_PASSWORD);
    this.checkOtpOrThrow(otp!, dto.otp);
    return {};
  }

  async updatePassword(dto: UpdatePasswordDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(user.id, OTP_PURPOSE.FORGOT_PASSWORD);
    this.checkOtpOrThrow(otp!, dto.otp);
    await this.authRepository.updateUser(user.id, {
      password: dto.newPassword,
    });
    // Revoke toàn bộ token cũ
    await this.redisService.revokeAllUserJtis(user.id);
    return {};
  }

  // Helper để parse TTL từ chuỗi (15m, 7d, ...)
  private parseTTL(str: string): number {
    if (str.endsWith('m')) return parseInt(str) * 60;
    if (str.endsWith('h')) return parseInt(str) * 60 * 60;
    if (str.endsWith('d')) return parseInt(str) * 60 * 60 * 24;
    return parseInt(str);
  }
}

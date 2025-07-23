import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyRegisterDto } from './dto/verify-register.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ERROR_MESSAGE } from '../shared/message/error.message';
import { CustomJwtService } from '../jwt/custom-jwt.service';
import { JwtPayload } from '../shared/type/jwt.type';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { OTP_PURPOSE, USER_STATUS } from './auth.constant';
import { RedisService } from '../redis/redis.service';
import { AuthRepository } from 'src/auth/auth.repository';
import {
  RpcBadRequestException,
  RpcNotFoundException,
  RpcUnauthorizedException,
} from 'src/shared/exceptions/rpc.exceptions';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_PATTERNS } from './kafka.patterns';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly customJwtService: CustomJwtService,
    private readonly redisService: RedisService,
    @Inject('KAFKA_NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.notificationClient.subscribeToResponseOf(
      KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL,
    );
    this.notificationClient.subscribeToResponseOf(
      KAFKA_PATTERNS.NOTIFICATION_FORGOT_PASSWORD,
    );
  }

  private async getUserByEmailOrThrow(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new RpcNotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    return user;
  }

  private checkOtpOrThrow(otpObj: any, otp: string) {
    if (!otpObj || otpObj.code !== otp)
      throw new RpcBadRequestException(ERROR_MESSAGE.INVALID_OTP);
    if (otpObj.expiresAt < new Date())
      throw new RpcBadRequestException(ERROR_MESSAGE.OTP_EXPIRED);
  }

  async sendRegisterOtp(dto: RegisterDto) {
    let user = await this.authRepository.findUserByEmail(dto.email);
    if (user && user.status === USER_STATUS.VERIFIED) {
      throw new RpcBadRequestException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    }
    if (!user) {
      user = await this.authRepository.createUser({
        email: dto.email,
        status: USER_STATUS.UNVERIFIED,
        username: dto.email,
      });
    }
    const otp = await this.authRepository.createOTP({
      userId: user.id,
      purpose: OTP_PURPOSE.EMAIL_VERIFICATION,
    });
    // Gửi message sang notification-service
    console.log('[AUTH-SERVICE] Emit notification', {
      topic: KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL,
      payload: { email: dto.email, otp: otp.code },
    });
    this.notificationClient
      .emit(KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL, {
        email: dto.email,
        otp: otp.code,
      })
      .subscribe({
        next: (res) => console.log('[AUTH-SERVICE] Emit result:', res),
        error: (err) => console.error('[AUTH-SERVICE] Emit error:', err),
      });
    return {};
  }

  async completeRegister(dto: CompleteRegisterDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user || user.status !== USER_STATUS.UNVERIFIED) {
      throw new RpcBadRequestException(
        ERROR_MESSAGE.USER_NOT_FOUND_OR_NOT_UNVERIFIED,
      );
    }
    const otp = await this.authRepository.findOTP(
      user.id,
      OTP_PURPOSE.EMAIL_VERIFICATION,
    );
    this.checkOtpOrThrow(otp!, dto.otp);
    const updatedUser = await this.authRepository.updateUser(user.id, {
      username: dto.username,
      password: dto.password,
      status: USER_STATUS.VERIFIED,
    });
    await this.authRepository.deleteOTP(otp!.id);
    const payload: JwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      username: updatedUser.username,
    };
    const {
      accessToken,
      expiresIn: accessTokenExpiresIn,
      jti: atJti,
    } = this.customJwtService.createAT(payload);
    const {
      refreshToken,
      expiresIn: refreshTokenExpiresIn,
      jti: rtJti,
    } = this.customJwtService.createRT(payload);
    // Lưu jti vào Redis
    await this.redisService.setJti(atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.setJti(rtJti, this.parseTTL(refreshTokenExpiresIn));
    await this.redisService.addJtiToUserSet(
      user.id,
      atJti,
      this.parseTTL(accessTokenExpiresIn),
    );
    await this.redisService.addJtiToUserSet(
      user.id,
      rtJti,
      this.parseTTL(refreshTokenExpiresIn),
    );
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new RpcNotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }
    if (!user.password || dto.password !== user.password) {
      throw new RpcUnauthorizedException(ERROR_MESSAGE.INVALID_PASSWORD);
    }
    if (user.status !== USER_STATUS.VERIFIED)
      throw new RpcUnauthorizedException(ERROR_MESSAGE.USER_NOT_VERIFIED);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      username: user.username,
    };
    const {
      accessToken,
      expiresIn: accessTokenExpiresIn,
      jti: atJti,
    } = this.customJwtService.createAT(payload);
    const {
      refreshToken,
      expiresIn: refreshTokenExpiresIn,
      jti: rtJti,
    } = this.customJwtService.createRT(payload);
    // Lưu jti vào Redis
    await this.redisService.setJti(atJti, this.parseTTL(accessTokenExpiresIn));
    await this.redisService.setJti(rtJti, this.parseTTL(refreshTokenExpiresIn));
    await this.redisService.addJtiToUserSet(
      user.id,
      atJti,
      this.parseTTL(accessTokenExpiresIn),
    );
    await this.redisService.addJtiToUserSet(
      user.id,
      rtJti,
      this.parseTTL(refreshTokenExpiresIn),
    );
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.customJwtService.verify<JwtPayload>(
        dto.refreshToken,
      );
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) throw new RpcNotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        username: user.username,
        jti: payload.jti,
      };
      const { accessToken, expiresIn: accessTokenExpiresIn } =
        this.customJwtService.createAT(newPayload);
      const { refreshToken, expiresIn: refreshTokenExpiresIn } =
        this.customJwtService.createRT(newPayload);
      return {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      };
    } catch {
      throw new RpcUnauthorizedException(ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * Logout phiên hiện tại: nhận accessToken, decode lấy jti và userId, xóa khỏi Redis
   */
  async logout(accessToken: string) {
    try {
      const payload = this.customJwtService.verify<JwtPayload>(accessToken);
      //Đoạn này để debug
      if (!payload.jti) {
        throw new RpcUnauthorizedException(ERROR_MESSAGE.TOKEN_MISSING_JTI);
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
    const otp = await this.authRepository.createOTP({
      userId: user.id,
      purpose: OTP_PURPOSE.FORGOT_PASSWORD,
    });
    // Gửi message sang notification-service
    this.notificationClient.emit(KAFKA_PATTERNS.NOTIFICATION_FORGOT_PASSWORD, {
      email: dto.email,
      otp: otp.code,
    });
    return {};
  }

  async verifyRegister(dto: VerifyRegisterDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(
      user.id,
      OTP_PURPOSE.EMAIL_VERIFICATION,
    );
    this.checkOtpOrThrow(otp!, dto.otp);
    await this.authRepository.updateUser(user.id, {
      status: USER_STATUS.VERIFIED,
    });
    return {};
  }

  async verifyForgotPassword(dto: VerifyForgotPasswordDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(
      user.id,
      OTP_PURPOSE.FORGOT_PASSWORD,
    );
    this.checkOtpOrThrow(otp!, dto.otp);
    return {};
  }

  async updatePassword(dto: UpdatePasswordDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);
    const otp = await this.authRepository.findOTP(
      user.id,
      OTP_PURPOSE.FORGOT_PASSWORD,
    );
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

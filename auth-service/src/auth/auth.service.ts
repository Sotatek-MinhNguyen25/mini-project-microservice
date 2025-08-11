import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyRegisterDto } from './dto/verify-register.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ERROR_MESSAGE } from '../shared/message/error.message';
import { JwtPayload } from '../shared/type/jwt.type';
import { CompleteRegisterDto } from './dto/complete-register.dto';
import { USER_STATUS, OTP_PURPOSE, OTP_STATUS } from './auth.constant';
import { AuthRepository } from 'src/auth/auth.repository';
import {
  RpcBadRequestException,
  RpcNotFoundException,
  RpcUnauthorizedException,
} from 'src/shared/exceptions/rpc.exceptions';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_PATTERNS } from './kafka.patterns';
import { AppLoggerService } from '../common/services/logger.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthTokenService } from './services/auth-token.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authOtpService: AuthOtpService,
    private readonly authTokenService: AuthTokenService,
    @Inject('KAFKA_NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientKafka,
    private readonly logger: AppLoggerService,
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

  async sendRegisterOtp(dto: RegisterDto) {
    let user = await this.authRepository.findUserByEmail(dto.email);

    if (user) {
      if (user.status !== USER_STATUS.UNVERIFIED) {
        this.logger.warn(
          `User already exists with verified status: ${dto.email}`,
          {
            method: 'sendRegisterOtp',
            endpoint: 'auth/register',
            additionalData: { email: dto.email, status: user.status },
          },
        );
        throw new RpcBadRequestException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
      }
      // If user is UNVERIFIED, continue to create new OTP
    } else {
      user = await this.authRepository.createUser({
        email: dto.email,
        status: USER_STATUS.UNVERIFIED,
        username: dto.email,
      });
    }

    const otp = await this.authOtpService.createEmailVerificationOtp(dto.email);

    // Send message to notification service
    this.logger.info(`Sending registration OTP notification for ${dto.email}`, {
      method: 'sendRegisterOtp',
      endpoint: 'auth/register',
      additionalData: {
        email: dto.email,
        topic: KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL,
      },
    });

    this.notificationClient
      .emit(KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL, {
        email: dto.email,
        otp: otp,
      })
      .subscribe({
        next: (res) =>
          this.logger.logKafkaMessage(
            KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL,
            { email: dto.email, otp },
            res,
          ),
        error: (err) =>
          this.logger.logKafkaError(
            KAFKA_PATTERNS.NOTIFICATION_VERIFY_REGISTER_EMAIL,
            { email: dto.email, otp },
            err,
          ),
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

    await this.authOtpService.verifyOtp(
      dto.email,
      dto.otp,
      OTP_PURPOSE.EMAIL_VERIFICATION,
    );

    const updatedUser = await this.authRepository.updateUser(user.id, {
      username: dto.username,
      password: dto.password,
      status: USER_STATUS.VERIFIED,
    });

    await this.authOtpService.deleteOtp(
      dto.email,
      OTP_PURPOSE.EMAIL_VERIFICATION,
      dto.otp,
    );

    const payload: JwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      username: updatedUser.username,
    };

    const tokens = await this.authTokenService.createTokens(payload);

    this.logger.info(`User registration completed successfully: ${dto.email}`, {
      method: 'completeRegister',
      endpoint: 'auth/complete-register',
      userId: updatedUser.id,
    });

    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new RpcNotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    if (!user.password || dto.password !== user.password) {
      throw new RpcUnauthorizedException(ERROR_MESSAGE.INVALID_PASSWORD);
    }

    if (user.status !== USER_STATUS.VERIFIED) {
      throw new RpcUnauthorizedException(ERROR_MESSAGE.USER_NOT_VERIFIED);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      username: user.username,
    };

    const tokens = await this.authTokenService.createTokens(payload);

    this.logger.info(`User login successful: ${dto.email}`, {
      method: 'login',
      endpoint: 'auth/login',
      userId: user.id,
    });

    return tokens;
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const tokens = await this.authTokenService.refreshAccessToken(
        dto.refreshToken,
      );

      this.logger.info(`Token refreshed successfully`, {
        method: 'refreshToken',
        endpoint: 'auth/refresh',
      });

      return {
        ...tokens,
        refreshToken: dto.refreshToken, // Keep old refresh token
      };
    } catch (error) {
      this.logger.error('Token refresh failed', {
        method: 'refreshToken',
        endpoint: 'auth/refresh',
        additionalData: { error: error.message },
      });
      throw new RpcUnauthorizedException(ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(accessToken: string) {
    try {
      await this.authTokenService.logout(accessToken);
      return {};
    } catch (error) {
      this.logger.error('Logout failed', {
        method: 'logout',
        endpoint: 'auth/logout',
        additionalData: { error: error.message },
      });
      return { message: 'Logout failed: ' + (error.message || error) };
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    await this.getUserByEmailOrThrow(dto.email);

    const otp = await this.authOtpService.createForgotPasswordOtp(dto.email);

    // Send message to notification service
    this.logger.info(
      `Sending forgot password OTP notification for ${dto.email}`,
      {
        method: 'forgotPassword',
        endpoint: 'auth/forgot-password',
        additionalData: {
          email: dto.email,
          topic: KAFKA_PATTERNS.NOTIFICATION_FORGOT_PASSWORD,
        },
      },
    );

    this.notificationClient.emit(KAFKA_PATTERNS.NOTIFICATION_FORGOT_PASSWORD, {
      email: dto.email,
      otp,
    });

    return {};
  }

  async verifyRegister(dto: VerifyRegisterDto) {
    const user = await this.getUserByEmailOrThrow(dto.email);

    await this.authOtpService.verifyOtp(
      dto.email,
      dto.otp,
      OTP_PURPOSE.EMAIL_VERIFICATION,
    );

    await this.authRepository.updateUser(user.id, {
      status: USER_STATUS.VERIFIED,
    });

    this.logger.info(`User email verified successfully: ${dto.email}`, {
      method: 'verifyRegister',
      endpoint: 'auth/verify-register',
      userId: user.id,
    });

    return {};
  }

  async verifyForgotPassword(dto: VerifyForgotPasswordDto) {
    await this.authOtpService.verifyOtp(
      dto.email,
      dto.otp,
      OTP_PURPOSE.FORGOT_PASSWORD,
    );

    await this.authOtpService.updateOtpStatus(
      dto.email,
      OTP_PURPOSE.FORGOT_PASSWORD,
      OTP_STATUS.VERIFIED,
    );

    this.logger.info(
      `Forgot password OTP verified successfully: ${dto.email}`,
      {
        method: 'verifyForgotPassword',
        endpoint: 'auth/verify-forgot-password',
        additionalData: { email: dto.email },
      },
    );

    return {};
  }

  async updatePassword(dto: UpdatePasswordDto) {
    await this.authOtpService.verifyOtp(
      dto.email,
      dto.otp,
      OTP_PURPOSE.FORGOT_PASSWORD,
    );

    const user = await this.getUserByEmailOrThrow(dto.email);

    await this.authRepository.updateUser(user.id, {
      password: dto.newPassword,
    });

    await this.authOtpService.deleteOtp(
      dto.email,
      OTP_PURPOSE.FORGOT_PASSWORD,
      dto.otp,
    );

    // Revoke all old tokens
    await this.authTokenService.logoutAllByUserId(user.id);

    this.logger.info(`Password updated successfully for user: ${dto.email}`, {
      method: 'updatePassword',
      endpoint: 'auth/update-password',
      userId: user.id,
    });

    return {};
  }

  async logoutAllByUserId(userId: string) {
    try {
      await this.authTokenService.logoutAllByUserId(userId);
      return {};
    } catch (error) {
      this.logger.error('Logout all failed', {
        method: 'logoutAllByUserId',
        endpoint: 'auth/logout-all',
        userId,
        additionalData: { error: error.message },
      });
      return { message: 'Logout all failed: ' + (error.message || error) };
    }
  }

  /**
   * Verify token and return user payload
   * Called from API Gateway to verify token
   */
  async verifyToken(token: string) {
    try {
      const payload = await this.authTokenService.verifyToken(token);

      // Check if user exists and is active
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        throw new RpcUnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
      }

      // Check user status
      if (user.status !== USER_STATUS.VERIFIED) {
        throw new RpcUnauthorizedException(ERROR_MESSAGE.USER_NOT_VERIFIED);
      }

      // Return enriched payload with user information
      return {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        jti: payload.jti,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      this.logger.error('Token verification failed', {
        method: 'verifyToken',
        endpoint: 'auth/verify-token',
        additionalData: { error: error.message },
      });
      throw new RpcUnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { OTP_PURPOSE, OTP_STATUS } from '../auth.constant';
import { RpcBadRequestException } from '../../shared/exceptions/rpc.exceptions';
import { ERROR_MESSAGE } from '../../shared/message/error.message';
import { AppLoggerService } from '../../common/services/logger.service';
import { OtpPurpose, OtpStatus } from '../auth.constant';

@Injectable()
export class AuthOtpService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Create OTP for email verification
   */
  async createEmailVerificationOtp(email: string): Promise<string> {
    const ttl = this.parseTTL(
      this.configService.get<string>('OTP_TTL') ||
        APP_CONSTANTS.TIME.DEFAULT_OTP_TTL.toString(),
    );

    const otp = await this.redisService.createForgotOtp(
      email,
      OTP_PURPOSE.EMAIL_VERIFICATION,
      ttl,
    );

    this.logger.info(`Email verification OTP created for ${email}`, {
      method: 'createEmailVerificationOtp',
      endpoint: 'auth/otp',
      additionalData: { email, ttl },
    });

    return otp;
  }

  /**
   * Create OTP for forgot password
   */
  async createForgotPasswordOtp(email: string): Promise<string> {
    const ttl = parseInt(
      this.configService.get<string>('FORGOT_OTP_TTL') ||
        APP_CONSTANTS.TIME.DEFAULT_FORGOT_OTP_TTL.toString(),
      10,
    );

    const otp = await this.redisService.createForgotOtp(
      email,
      OTP_PURPOSE.FORGOT_PASSWORD,
      ttl,
    );

    this.logger.info(`Forgot password OTP created for ${email}`, {
      method: 'createForgotPasswordOtp',
      endpoint: 'auth/forgot-password',
      additionalData: { email, ttl },
    });

    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    email: string,
    otp: string,
    otpPurpose: OtpPurpose,
  ): Promise<void> {
    const otpObj = await this.redisService.getOtp(email, otpPurpose);

    if (!otpObj || otpObj.otp !== otp) {
      throw new RpcBadRequestException(ERROR_MESSAGE.INVALID_OTP);
    }

    if (otpObj.expiresAt < new Date() || otpObj.status !== OTP_STATUS.CREATED) {
      throw new RpcBadRequestException(ERROR_MESSAGE.OTP_EXPIRED);
    }

    this.logger.info(`OTP verified successfully for ${email}`, {
      method: 'verifyOtp',
      endpoint: 'auth/verify-otp',
      additionalData: { email, otpPurpose },
    });
  }

  /**
   * Update OTP status
   */
  async updateOtpStatus(
    email: string,
    otpPurpose: OtpPurpose,
    status: OtpStatus,
  ): Promise<void> {
    await this.redisService.updateOtpStatus(email, otpPurpose, status);
  }

  /**
   * Delete OTP
   */
  async deleteOtp(
    email: string,
    otpPurpose: OtpPurpose,
    otp: string,
  ): Promise<void> {
    await this.redisService.deleteOtp(email, otpPurpose, otp);
  }

  /**
   * Parse TTL from string (15m, 7d, ...)
   */
  private parseTTL(str: string): number {
    if (str.endsWith('m'))
      return parseInt(str) * APP_CONSTANTS.TIME.SECONDS_IN_MINUTE;
    if (str.endsWith('h'))
      return (
        parseInt(str) *
        APP_CONSTANTS.TIME.SECONDS_IN_MINUTE *
        APP_CONSTANTS.TIME.MINUTES_IN_HOUR
      );
    if (str.endsWith('d'))
      return (
        parseInt(str) *
        APP_CONSTANTS.TIME.SECONDS_IN_MINUTE *
        APP_CONSTANTS.TIME.MINUTES_IN_HOUR *
        APP_CONSTANTS.TIME.HOURS_IN_DAY
      );
    return parseInt(str);
  }
}

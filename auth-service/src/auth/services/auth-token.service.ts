import { Injectable } from '@nestjs/common';
import { CustomJwtService } from '../../jwt/custom-jwt.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from '../../shared/type/jwt.type';
import { AppLoggerService } from '../../common/services/logger.service';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly customJwtService: CustomJwtService,
    private readonly redisService: RedisService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Create access and refresh tokens
   */
  async createTokens(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
  }> {
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

    // Store JTIs in Redis
    await this.storeJtiInRedis(atJti, accessTokenExpiresIn, payload.sub);
    await this.storeJtiInRedis(rtJti, refreshTokenExpiresIn, payload.sub);

    this.logger.info(`Tokens created for user ${payload.sub}`, {
      method: 'createTokens',
      endpoint: 'auth/tokens',
      userId: payload.sub,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  /**
   * Create new access token from refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    accessTokenExpiresIn: string;
  }> {
    const payload = this.customJwtService.verify<JwtPayload>(refreshToken);

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      username: payload.username,
    };

    const {
      accessToken,
      expiresIn: accessTokenExpiresIn,
      jti: atJti,
    } = this.customJwtService.createAT(newPayload);

    // Store new JTI in Redis
    await this.storeJtiInRedis(atJti, accessTokenExpiresIn, payload.sub);

    this.logger.info(`Access token refreshed for user ${payload.sub}`, {
      method: 'refreshAccessToken',
      endpoint: 'auth/refresh',
      userId: payload.sub,
    });

    return {
      accessToken,
      accessTokenExpiresIn,
    };
  }

  /**
   * Verify token and return user payload
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token');
    }

    let payload: JwtPayload;

    try {
      payload = this.customJwtService.verify<JwtPayload>(token);
    } catch (error) {
      this.logger.error('Token verification failed', {
        method: 'verifyToken',
        endpoint: 'auth/verify',
        additionalData: { error: error.message },
      });
      throw new Error('Invalid token');
    }

    // Validate payload
    if (
      !payload ||
      typeof payload !== 'object' ||
      !payload.jti ||
      !payload.sub
    ) {
      throw new Error('Token missing JTI');
    }

    // Check if JTI is valid in Redis
    const isJtiValid = await this.redisService.isJtiValid(payload.jti);
    if (!isJtiValid) {
      throw new Error('Token expired or revoked');
    }

    this.logger.info(`Token verified successfully for user ${payload.sub}`, {
      method: 'verifyToken',
      endpoint: 'auth/verify',
      userId: payload.sub,
    });

    return payload;
  }

  /**
   * Logout current session
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const payload = this.customJwtService.verify<JwtPayload>(accessToken);

      if (!payload.jti) {
        throw new Error('Token missing JTI');
      }

      await this.redisService.delJti(payload.jti);
      await this.redisService.removeJtiFromUserSet(payload.sub, payload.jti);

      this.logger.info(`User ${payload.sub} logged out`, {
        method: 'logout',
        endpoint: 'auth/logout',
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error('Logout failed', {
        method: 'logout',
        endpoint: 'auth/logout',
        additionalData: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAllByUserId(userId: string): Promise<void> {
    try {
      const jtis = await this.redisService.getUserJtis(userId);

      for (const jti of jtis) {
        await this.redisService.delJti(jti);
      }

      await this.redisService.revokeAllUserJtis(userId);

      this.logger.info(`All sessions logged out for user ${userId}`, {
        method: 'logoutAllByUserId',
        endpoint: 'auth/logout-all',
        userId,
      });
    } catch (error) {
      this.logger.error('Logout all failed', {
        method: 'logoutAllByUserId',
        endpoint: 'auth/logout-all',
        userId,
        additionalData: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Store JTI in Redis
   */
  private async storeJtiInRedis(
    jti: string,
    expiresIn: string,
    userId: string,
  ): Promise<void> {
    const ttl = this.parseTTL(expiresIn);

    await this.redisService.setJti(jti, ttl);
    await this.redisService.addJtiToUserSet(userId, jti, ttl);
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

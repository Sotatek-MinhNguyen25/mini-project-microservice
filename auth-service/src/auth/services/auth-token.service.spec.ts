import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthTokenService } from './auth-token.service';
import { CustomJwtService } from '../../jwt/custom-jwt.service';
import { RedisService } from '../../redis/redis.service';
import { AppLoggerService } from '../../common/services/logger.service';
import { RpcUnauthorizedException } from '../../shared/exceptions/rpc.exceptions';
import { ERROR_MESSAGE } from '../../shared/message/error.message';
import { JwtPayload } from '../../shared/type/jwt.type';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let mockCustomJwtService: jest.Mocked<CustomJwtService>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLoggerService: jest.Mocked<AppLoggerService>;

  const mockJwtPayload: JwtPayload = {
    sub: 'user123',
    email: 'test@example.com',
    jti: 'jti123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const mockCustomJwtServiceProvider = {
      provide: CustomJwtService,
      useValue: {
        sign: jest.fn(),
        verify: jest.fn(),
      },
    };

    const mockRedisServiceProvider = {
      provide: RedisService,
      useValue: {
        setJti: jest.fn(),
        addJtiToUserSet: jest.fn(),
        delJti: jest.fn(),
        getUserJtis: jest.fn(),
        revokeAllUserJtis: jest.fn(),
      },
    };

    const mockConfigServiceProvider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn(),
      },
    };

    const mockLoggerServiceProvider = {
      provide: AppLoggerService,
      useValue: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        mockCustomJwtServiceProvider,
        mockRedisServiceProvider,
        mockConfigServiceProvider,
        mockLoggerServiceProvider,
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
    mockCustomJwtService = module.get(CustomJwtService);
    mockRedisService = module.get(RedisService);
    mockConfigService = module.get(ConfigService);
    mockLoggerService = module.get(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTokens', () => {
    it('should create access and refresh tokens successfully', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('15m') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('7d'); // REFRESH_TOKEN_EXPIRES_IN

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.createTokens(payload);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      });

      expect(mockCustomJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockRedisService.setJti).toHaveBeenCalledWith(payload.jti, 900);
      expect(mockRedisService.addJtiToUserSet).toHaveBeenCalledWith(
        payload.sub,
        payload.jti,
        900,
      );
    });

    it('should use default expiration times when config is not provided', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      mockConfigService.get.mockReturnValue(undefined);

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.createTokens(payload);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        expiresIn: 900, // Default 15 minutes
      });
    });

    it('should parse TTL with minutes suffix correctly', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('30m') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('7d'); // REFRESH_TOKEN_EXPIRES_IN

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.createTokens(payload);

      expect(result.expiresIn).toBe(1800); // 30 * 60 seconds
    });

    it('should parse TTL with hours suffix correctly', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('2h') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('7d'); // REFRESH_TOKEN_EXPIRES_IN

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.createTokens(payload);

      expect(result.expiresIn).toBe(7200); // 2 * 60 * 60 seconds
    });

    it('should parse TTL with days suffix correctly', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('15m') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('14d'); // REFRESH_TOKEN_EXPIRES_IN

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.createTokens(payload);

      expect(result.expiresIn).toBe(900); // 15 minutes
      // Refresh token TTL should be 14 * 24 * 60 * 60 = 1209600 seconds
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'refresh.token.123';
      const newAccessToken = 'new.access.token.123';
      const newRefreshToken = 'new.refresh.token.123';

      mockCustomJwtService.verify.mockReturnValue(mockJwtPayload);
      mockCustomJwtService.sign
        .mockReturnValueOnce(newAccessToken)
        .mockReturnValueOnce(newRefreshToken);

      mockConfigService.get
        .mockReturnValueOnce('15m') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('7d'); // REFRESH_TOKEN_EXPIRES_IN

      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const result = await service.refreshAccessToken(refreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      });

      expect(mockCustomJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(mockCustomJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw error when refresh token is invalid', async () => {
      const refreshToken = 'invalid.token';

      mockCustomJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
      );
    });

    it('should throw error when JTI is missing', async () => {
      const refreshToken = 'refresh.token.123';
      const payloadWithoutJti = { ...mockJwtPayload };
      delete payloadWithoutJti.jti;

      mockCustomJwtService.verify.mockReturnValue(payloadWithoutJti);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
      );
    });

    it('should throw error when sub is missing', async () => {
      const refreshToken = 'refresh.token.123';
      const payloadWithoutSub = { ...mockJwtPayload };
      delete payloadWithoutSub.sub;

      mockCustomJwtService.verify.mockReturnValue(payloadWithoutSub);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const accessToken = 'access.token.123';

      mockCustomJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = await service.verifyToken(accessToken);

      expect(result).toEqual(mockJwtPayload);
      expect(mockCustomJwtService.verify).toHaveBeenCalledWith(accessToken);
    });

    it('should throw error when token is invalid', async () => {
      const accessToken = 'invalid.token';

      mockCustomJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken(accessToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.verifyToken(accessToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_TOKEN,
      );
    });

    it('should throw error when JTI is missing', async () => {
      const accessToken = 'access.token.123';
      const payloadWithoutJti = { ...mockJwtPayload };
      delete payloadWithoutJti.jti;

      mockCustomJwtService.verify.mockReturnValue(payloadWithoutJti);

      await expect(service.verifyToken(accessToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.verifyToken(accessToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_TOKEN,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const accessToken = 'access.token.123';

      mockCustomJwtService.verify.mockReturnValue(mockJwtPayload);
      mockRedisService.delJti.mockResolvedValue(undefined);

      await expect(service.logout(accessToken)).resolves.toBeUndefined();

      expect(mockCustomJwtService.verify).toHaveBeenCalledWith(accessToken);
      expect(mockRedisService.delJti).toHaveBeenCalledWith(mockJwtPayload.jti);
    });

    it('should throw error when token is invalid', async () => {
      const accessToken = 'invalid.token';

      mockCustomJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.logout(accessToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.logout(accessToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_TOKEN,
      );
    });

    it('should throw error when JTI is missing', async () => {
      const accessToken = 'access.token.123';
      const payloadWithoutJti = { ...mockJwtPayload };
      delete payloadWithoutJti.jti;

      mockCustomJwtService.verify.mockReturnValue(payloadWithoutJti);

      await expect(service.logout(accessToken)).rejects.toThrow(
        RpcUnauthorizedException,
      );
      await expect(service.logout(accessToken)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_TOKEN,
      );
    });
  });

  describe('logoutAllByUserId', () => {
    it('should logout all user sessions successfully', async () => {
      const userId = 'user123';
      const jtis = ['jti1', 'jti2', 'jti3'];

      mockRedisService.getUserJtis.mockResolvedValue(jtis);
      mockRedisService.delJti.mockResolvedValue(undefined);
      mockRedisService.revokeAllUserJtis.mockResolvedValue(undefined);

      await expect(service.logoutAllByUserId(userId)).resolves.toBeUndefined();

      expect(mockRedisService.getUserJtis).toHaveBeenCalledWith(userId);
      expect(mockRedisService.delJti).toHaveBeenCalledTimes(3);
      expect(mockRedisService.revokeAllUserJtis).toHaveBeenCalledWith(userId);
    });

    it('should handle user with no active sessions', async () => {
      const userId = 'user123';

      mockRedisService.getUserJtis.mockResolvedValue([]);
      mockRedisService.revokeAllUserJtis.mockResolvedValue(undefined);

      await expect(service.logoutAllByUserId(userId)).resolves.toBeUndefined();

      expect(mockRedisService.getUserJtis).toHaveBeenCalledWith(userId);
      expect(mockRedisService.delJti).not.toHaveBeenCalled();
      expect(mockRedisService.revokeAllUserJtis).toHaveBeenCalledWith(userId);
    });
  });

  describe('parseTTL', () => {
    it('should parse minutes correctly', () => {
      const result = (service as any).parseTTL('10m');
      expect(result).toBe(600); // 10 * 60 seconds
    });

    it('should parse hours correctly', () => {
      const result = (service as any).parseTTL('2h');
      expect(result).toBe(7200); // 2 * 60 * 60 seconds
    });

    it('should parse days correctly', () => {
      const result = (service as any).parseTTL('1d');
      expect(result).toBe(86400); // 1 * 24 * 60 * 60 seconds
    });

    it('should parse numeric string without suffix', () => {
      const result = (service as any).parseTTL('300');
      expect(result).toBe(300);
    });

    it('should handle edge cases', () => {
      expect((service as any).parseTTL('0m')).toBe(0);
      expect((service as any).parseTTL('0h')).toBe(0);
      expect((service as any).parseTTL('0d')).toBe(0);
    });
  });

  describe('integration tests', () => {
    it('should handle complete token lifecycle', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      // Create tokens
      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      mockConfigService.get
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('7d');
      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const createdTokens = await service.createTokens(payload);
      expect(createdTokens.accessToken).toBe(accessToken);

      // Verify token
      mockCustomJwtService.verify.mockReturnValue(mockJwtPayload);
      const verifiedPayload = await service.verifyToken(accessToken);
      expect(verifiedPayload).toEqual(mockJwtPayload);

      // Logout
      mockRedisService.delJti.mockResolvedValue(undefined);
      await expect(service.logout(accessToken)).resolves.toBeUndefined();
    });

    it('should handle token refresh flow', async () => {
      const refreshToken = 'refresh.token.123';
      const newAccessToken = 'new.access.token.123';
      const newRefreshToken = 'new.refresh.token.123';

      // Verify refresh token
      mockCustomJwtService.verify.mockReturnValue(mockJwtPayload);

      // Create new tokens
      mockCustomJwtService.sign
        .mockReturnValueOnce(newAccessToken)
        .mockReturnValueOnce(newRefreshToken);
      mockConfigService.get
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('7d');
      mockRedisService.setJti.mockResolvedValue(undefined);
      mockRedisService.addJtiToUserSet.mockResolvedValue(undefined);

      const refreshedTokens = await service.refreshAccessToken(refreshToken);
      expect(refreshedTokens.accessToken).toBe(newAccessToken);
      expect(refreshedTokens.refreshToken).toBe(newRefreshToken);
    });
  });

  describe('error handling', () => {
    it('should handle Redis service errors gracefully', async () => {
      const payload = { ...mockJwtPayload };
      const accessToken = 'access.token.123';
      const refreshToken = 'refresh.token.123';

      mockCustomJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      mockConfigService.get
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('7d');

      const redisError = new Error('Redis connection failed');
      mockRedisService.setJti.mockRejectedValue(redisError);

      await expect(service.createTokens(payload)).rejects.toThrow(redisError);
    });

    it('should handle JWT service errors gracefully', async () => {
      const payload = { ...mockJwtPayload };

      const jwtError = new Error('JWT signing failed');
      mockCustomJwtService.sign.mockImplementation(() => {
        throw jwtError;
      });

      await expect(service.createTokens(payload)).rejects.toThrow(jwtError);
    });
  });
});

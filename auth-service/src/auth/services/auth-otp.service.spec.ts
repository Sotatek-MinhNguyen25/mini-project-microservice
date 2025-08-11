import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthOtpService } from './auth-otp.service';
import { RedisService } from '../../redis/redis.service';
import { AppLoggerService } from '../../common/services/logger.service';
import { RpcBadRequestException } from '../../shared/exceptions/rpc.exceptions';
import { ERROR_MESSAGE } from '../../shared/message/error.message';
import { OTP_PURPOSE, OTP_STATUS } from '../auth.constant';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

describe('AuthOtpService', () => {
  let service: AuthOtpService;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLoggerService: jest.Mocked<AppLoggerService>;

  beforeEach(async () => {
    const mockRedisServiceProvider = {
      provide: RedisService,
      useValue: {
        createForgotOtp: jest.fn(),
        getOtp: jest.fn(),
        updateOtpStatus: jest.fn(),
        deleteOtp: jest.fn(),
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
        AuthOtpService,
        mockRedisServiceProvider,
        mockConfigServiceProvider,
        mockLoggerServiceProvider,
      ],
    }).compile();

    service = module.get<AuthOtpService>(AuthOtpService);
    mockRedisService = module.get(RedisService);
    mockConfigService = module.get(ConfigService);
    mockLoggerService = module.get(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEmailVerificationOtp', () => {
    it('should create email verification OTP successfully', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';
      const expectedTtl = 300;

      mockConfigService.get.mockReturnValue('300');
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createEmailVerificationOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.EMAIL_VERIFICATION,
        expectedTtl,
      );
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        `Email verification OTP created for ${email}`,
        {
          method: 'createEmailVerificationOtp',
          endpoint: 'auth/otp',
          additionalData: { email, ttl: expectedTtl },
        },
      );
    });

    it('should use default TTL when config is not provided', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockReturnValue(undefined);
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createEmailVerificationOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.EMAIL_VERIFICATION,
        APP_CONSTANTS.TIME.DEFAULT_OTP_TTL,
      );
    });

    it('should parse TTL with minutes suffix correctly', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockReturnValue('5m');
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createEmailVerificationOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.EMAIL_VERIFICATION,
        300, // 5 * 60 seconds
      );
    });

    it('should parse TTL with hours suffix correctly', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockReturnValue('2h');
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createEmailVerificationOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.EMAIL_VERIFICATION,
        7200, // 2 * 60 * 60 seconds
      );
    });

    it('should parse TTL with days suffix correctly', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockReturnValue('1d');
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createEmailVerificationOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.EMAIL_VERIFICATION,
        86400, // 1 * 24 * 60 * 60 seconds
      );
    });
  });

  describe('createForgotPasswordOtp', () => {
    it('should create forgot password OTP successfully', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';
      const expectedTtl = 600;

      mockConfigService.get.mockReturnValue('600');
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createForgotPasswordOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.FORGOT_PASSWORD,
        expectedTtl,
      );
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        `Forgot password OTP created for ${email}`,
        {
          method: 'createForgotPasswordOtp',
          endpoint: 'auth/forgot-password',
          additionalData: { email, ttl: expectedTtl },
        },
      );
    });

    it('should use default TTL when config is not provided', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockReturnValue(undefined);
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      const result = await service.createForgotPasswordOtp(email);

      expect(result).toBe(expectedOtp);
      expect(mockRedisService.createForgotOtp).toHaveBeenCalledWith(
        email,
        OTP_PURPOSE.FORGOT_PASSWORD,
        APP_CONSTANTS.TIME.DEFAULT_FORGOT_OTP_TTL,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const otpObj = {
        otp: '123456',
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        status: OTP_STATUS.CREATED,
      };

      mockRedisService.getOtp.mockResolvedValue(otpObj);

      await expect(
        service.verifyOtp(email, otp, otpPurpose),
      ).resolves.toBeUndefined();

      expect(mockRedisService.getOtp).toHaveBeenCalledWith(email, otpPurpose);
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        `OTP verified successfully for ${email}`,
        {
          method: 'verifyOtp',
          endpoint: 'auth/verify-otp',
          additionalData: { email, otpPurpose },
        },
      );
    });

    it('should throw error when OTP is invalid', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const otpObj = {
        otp: '654321', // Different OTP
        expiresAt: new Date(Date.now() + 60000),
        status: OTP_STATUS.CREATED,
      };

      mockRedisService.getOtp.mockResolvedValue(otpObj);

      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        RpcBadRequestException,
      );
      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_OTP,
      );
    });

    it('should throw error when OTP is expired', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const otpObj = {
        otp: '123456',
        expiresAt: new Date(Date.now() - 60000), // 1 minute ago
        status: OTP_STATUS.CREATED,
      };

      mockRedisService.getOtp.mockResolvedValue(otpObj);

      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        RpcBadRequestException,
      );
      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        ERROR_MESSAGE.OTP_EXPIRED,
      );
    });

    it('should throw error when OTP status is not CREATED', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const otpObj = {
        otp: '123456',
        expiresAt: new Date(Date.now() + 60000),
        status: OTP_STATUS.VERIFIED, // Already verified
      };

      mockRedisService.getOtp.mockResolvedValue(otpObj);

      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        RpcBadRequestException,
      );
      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        ERROR_MESSAGE.OTP_EXPIRED,
      );
    });

    it('should throw error when OTP is not found', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;

      mockRedisService.getOtp.mockResolvedValue(null);

      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        RpcBadRequestException,
      );
      await expect(service.verifyOtp(email, otp, otpPurpose)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_OTP,
      );
    });
  });

  describe('updateOtpStatus', () => {
    it('should update OTP status successfully', async () => {
      const email = 'test@example.com';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const status = OTP_STATUS.VERIFIED;

      mockRedisService.updateOtpStatus.mockResolvedValue(undefined);

      await expect(
        service.updateOtpStatus(email, otpPurpose, status),
      ).resolves.toBeUndefined();

      expect(mockRedisService.updateOtpStatus).toHaveBeenCalledWith(
        email,
        otpPurpose,
        status,
      );
    });
  });

  describe('deleteOtp', () => {
    it('should delete OTP successfully', async () => {
      const email = 'test@example.com';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;
      const otp = '123456';

      mockRedisService.deleteOtp.mockResolvedValue(undefined);

      await expect(
        service.deleteOtp(email, otpPurpose, otp),
      ).resolves.toBeUndefined();

      expect(mockRedisService.deleteOtp).toHaveBeenCalledWith(
        email,
        otpPurpose,
        otp,
      );
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
    it('should handle complete OTP lifecycle', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const otpPurpose = OTP_PURPOSE.EMAIL_VERIFICATION;

      // Create OTP
      mockConfigService.get.mockReturnValue('300');
      mockRedisService.createForgotOtp.mockResolvedValue(otp);
      const createdOtp = await service.createEmailVerificationOtp(email);
      expect(createdOtp).toBe(otp);

      // Verify OTP
      const otpObj = {
        otp: '123456',
        expiresAt: new Date(Date.now() + 60000),
        status: OTP_STATUS.CREATED,
      };
      mockRedisService.getOtp.mockResolvedValue(otpObj);
      await expect(
        service.verifyOtp(email, otp, otpPurpose),
      ).resolves.toBeUndefined();

      // Update status
      mockRedisService.updateOtpStatus.mockResolvedValue(undefined);
      await expect(
        service.updateOtpStatus(email, otpPurpose, OTP_STATUS.VERIFIED),
      ).resolves.toBeUndefined();

      // Delete OTP
      mockRedisService.deleteOtp.mockResolvedValue(undefined);
      await expect(
        service.deleteOtp(email, otpPurpose, otp),
      ).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle Redis service errors gracefully', async () => {
      const email = 'test@example.com';
      const error = new Error('Redis connection failed');

      mockRedisService.createForgotOtp.mockRejectedValue(error);

      await expect(service.createEmailVerificationOtp(email)).rejects.toThrow(
        error,
      );
    });

    it('should handle config service errors gracefully', async () => {
      const email = 'test@example.com';
      const expectedOtp = '123456';

      mockConfigService.get.mockImplementation(() => {
        throw new Error('Config error');
      });
      mockRedisService.createForgotOtp.mockResolvedValue(expectedOtp);

      // Should still work with default values
      const result = await service.createEmailVerificationOtp(email);
      expect(result).toBe(expectedOtp);
    });
  });
});

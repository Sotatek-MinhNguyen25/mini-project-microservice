/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AppLoggerService, LogLevel } from './logger.service';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockLoggerService = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppLoggerService,
        {
          provide: Logger,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<AppLoggerService>(AppLoggerService);
    mockLogger = module.get(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log method', () => {
    it('should call logger.debug when level is DEBUG', () => {
      service.log(LogLevel.DEBUG, 'Test debug message');
      expect(mockLogger.debug).toHaveBeenCalledWith('Test debug message');
    });

    it('should call logger.log when level is INFO', () => {
      service.log(LogLevel.INFO, 'Test info message');
      expect(mockLogger.log).toHaveBeenCalledWith('Test info message');
    });

    it('should call logger.warn when level is WARN', () => {
      service.log(LogLevel.WARN, 'Test warn message');
      expect(mockLogger.warn).toHaveBeenCalledWith('Test warn message');
    });

    it('should call logger.error when level is ERROR', () => {
      service.log(LogLevel.ERROR, 'Test error message');
      expect(mockLogger.error).toHaveBeenCalledWith('Test error message');
    });
  });

  describe('convenience methods', () => {
    it('should call debug method correctly', () => {
      service.debug('Debug message');
      expect(mockLogger.debug).toHaveBeenCalledWith('Debug message');
    });

    it('should call info method correctly', () => {
      service.info('Info message');
      expect(mockLogger.log).toHaveBeenCalledWith('Info message');
    });

    it('should call warn method correctly', () => {
      service.warn('Warn message');
      expect(mockLogger.warn).toHaveBeenCalledWith('Warn message');
    });

    it('should call error method correctly', () => {
      service.error('Error message');
      expect(mockLogger.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('logRequest', () => {
    it('should log request with basic info', () => {
      service.logRequest('GET', '/api/users', 'user123');
      expect(mockLogger.log).toHaveBeenCalledWith('GET /api/users', {
        method: 'GET',
        endpoint: '/api/users',
        userId: 'user123',
        additionalData: undefined,
      });
    });

    it('should log request with additional data', () => {
      const additionalData = { ip: '192.168.1.1', userAgent: 'Mozilla' };
      service.logRequest('POST', '/api/auth/login', 'user456', additionalData);
      expect(mockLogger.log).toHaveBeenCalledWith('POST /api/auth/login', {
        method: 'POST',
        endpoint: '/api/auth/login',
        userId: 'user456',
        additionalData,
      });
    });
  });

  describe('logResponse', () => {
    it('should log response with status code only', () => {
      service.logResponse('GET', '/api/users', 200);
      expect(mockLogger.log).toHaveBeenCalledWith('GET /api/users - 200', {
        method: 'GET',
        endpoint: '/api/users',
        statusCode: 200,
        responseTime: undefined,
      });
    });

    it('should log response with response time', () => {
      service.logResponse('POST', '/api/auth/login', 201, 150);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'POST /api/auth/login - 201 (150ms)',
        {
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 201,
          responseTime: 150,
        },
      );
    });
  });

  describe('logKafkaMessage', () => {
    it('should log Kafka message successfully', () => {
      const payload = { userId: '123', action: 'login' };
      const result = { success: true };
      service.logKafkaMessage('user.events', payload, result);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Kafka message sent to user.events',
        {
          topic: 'user.events',
          payload,
          result,
        },
      );
    });

    it('should log Kafka message without result', () => {
      const payload = { userId: '123', action: 'logout' };
      service.logKafkaMessage('user.events', payload);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Kafka message sent to user.events',
        {
          topic: 'user.events',
          payload,
          result: undefined,
        },
      );
    });
  });

  describe('logKafkaError', () => {
    it('should log Kafka error with error message', () => {
      const payload = { userId: '123', action: 'login' };
      const error = new Error('Connection failed');
      service.logKafkaError('user.events', payload, error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Kafka message failed for user.events',
        {
          topic: 'user.events',
          payload,
          error: 'Connection failed',
        },
      );
    });

    it('should log Kafka error with string error', () => {
      const payload = { userId: '123', action: 'login' };
      const error = 'Network timeout';
      service.logKafkaError('user.events', payload, error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Kafka message failed for user.events',
        {
          topic: 'user.events',
          payload,
          error: 'Network timeout',
        },
      );
    });
  });

  describe('formatLogMessage', () => {
    it('should return message without context when context is undefined', () => {
      const result = (service as any).formatLogMessage('Test message');
      expect(result).toBe('Test message');
    });

    it('should format message with method and endpoint', () => {
      const context = { method: 'GET', endpoint: '/api/users' };
      const result = (service as any).formatLogMessage('Test message', context);
      expect(result).toBe('Test message [GET /api/users]');
    });

    it('should format message with userId', () => {
      const context = { userId: 'user123' };
      const result = (service as any).formatLogMessage('Test message', context);
      expect(result).toBe('Test message [User: user123]');
    });

    it('should format message with requestId', () => {
      const context = { requestId: 'req-456' };
      const result = (service as any).formatLogMessage('Test message', context);
      expect(result).toBe('Test message [Request: req-456]');
    });

    it('should format message with multiple context parts', () => {
      const context = {
        method: 'POST',
        endpoint: '/api/auth/login',
        userId: 'user123',
        requestId: 'req-789',
      };
      const result = (service as any).formatLogMessage('Test message', context);
      expect(result).toBe(
        'Test message [POST /api/auth/login | User: user123 | Request: req-789]',
      );
    });
  });
});

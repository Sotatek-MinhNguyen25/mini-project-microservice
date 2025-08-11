import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { HealthService } from './common/services/health.service';
import { MetricsService } from './common/services/metrics.service';

describe('AppController', () => {
  let controller: AppController;
  let mockHealthService: jest.Mocked<HealthService>;
  let mockMetricsService: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    const mockHealthServiceProvider = {
      provide: HealthService,
      useValue: {
        getHealthStatus: jest.fn(),
        getDetailedHealthStatus: jest.fn(),
      },
    };

    const mockMetricsServiceProvider = {
      provide: MetricsService,
      useValue: {
        generatePrometheusMetrics: jest.fn(),
        incrementRequestCount: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [mockHealthServiceProvider, mockMetricsServiceProvider],
    }).compile();

    controller = module.get<AppController>(AppController);
    mockHealthService = module.get(HealthService);
    mockMetricsService = module.get(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return health status from HealthService', () => {
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };

      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      const result = controller.getHealth();

      expect(result).toEqual(mockHealthResponse);
      expect(mockHealthService.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should return different health status on subsequent calls', () => {
      const firstCall = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };

      const secondCall = {
        status: 'ok',
        timestamp: '2024-01-01T00:01:00.000Z',
        uptime: 3660,
      };

      mockHealthService.getHealthStatus.mockReturnValueOnce(firstCall).mockReturnValueOnce(secondCall);

      const result1 = controller.getHealth();
      const result2 = controller.getHealth();

      expect(result1).toEqual(firstCall);
      expect(result2).toEqual(secondCall);
      expect(mockHealthService.getHealthStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health status from HealthService', () => {
      const mockDetailedHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        checks: {
          database: true,
          kafka: true,
          redis: true,
          memory: true,
        },
      };

      mockHealthService.getDetailedHealthStatus.mockReturnValue(mockDetailedHealthResponse);

      const result = controller.getDetailedHealth();

      expect(result).toEqual(mockDetailedHealthResponse);
      expect(mockHealthService.getDetailedHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle detailed health with different check states', () => {
      const mockDetailedHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        checks: {
          database: false,
          kafka: true,
          redis: false,
          memory: true,
        },
      };

      mockHealthService.getDetailedHealthStatus.mockReturnValue(mockDetailedHealthResponse);

      const result = controller.getDetailedHealth();

      expect(result).toEqual(mockDetailedHealthResponse);
      expect(result.checks.database).toBe(false);
      expect(result.checks.kafka).toBe(true);
      expect(result.checks.redis).toBe(false);
      expect(result.checks.memory).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('should return Prometheus metrics from MetricsService', () => {
      const mockMetrics = `# HELP api_gateway_up Service status (1 = up, 0 = down)
# TYPE api_gateway_up gauge
api_gateway_up 1

# HELP api_gateway_uptime_seconds Service uptime in seconds
# TYPE api_gateway_uptime_seconds counter
api_gateway_uptime_seconds 3600`;

      mockMetricsService.generatePrometheusMetrics.mockReturnValue(mockMetrics);

      const result = controller.getMetrics();

      expect(result).toBe(mockMetrics);
      expect(mockMetricsService.generatePrometheusMetrics).toHaveBeenCalledTimes(1);
    });

    it('should return different metrics on subsequent calls', () => {
      const firstCall = `# HELP api_gateway_up Service status
api_gateway_up 1
api_gateway_uptime_seconds 3600`;

      const secondCall = `# HELP api_gateway_up Service status
api_gateway_up 1
api_gateway_uptime_seconds 3660`;

      mockMetricsService.generatePrometheusMetrics.mockReturnValueOnce(firstCall).mockReturnValueOnce(secondCall);

      const result1 = controller.getMetrics();
      const result2 = controller.getMetrics();

      expect(result1).toBe(firstCall);
      expect(result2).toBe(secondCall);
      expect(mockMetricsService.generatePrometheusMetrics).toHaveBeenCalledTimes(2);
    });
  });

  describe('smokeTest', () => {
    it('should return smoke test response', () => {
      const result = controller.smokeTest();

      expect(result).toEqual({
        message: 'API Gateway is working!',
        timestamp: expect.any(String),
        service: 'api-gateway',
        version: expect.any(String),
        environment: expect.any(String),
      });
    });

    it('should return valid timestamp', () => {
      const result = controller.smokeTest();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should return correct service name', () => {
      const result = controller.smokeTest();

      expect(result.service).toBe('api-gateway');
    });

    it('should return consistent response structure', () => {
      const result1 = controller.smokeTest();
      const result2 = controller.smokeTest();

      expect(result1).toHaveProperty('message');
      expect(result1).toHaveProperty('timestamp');
      expect(result1).toHaveProperty('service');
      expect(result1).toHaveProperty('version');
      expect(result1).toHaveProperty('environment');

      expect(result2).toHaveProperty('message');
      expect(result2).toHaveProperty('timestamp');
      expect(result2).toHaveProperty('service');
      expect(result2).toHaveProperty('version');
      expect(result2).toHaveProperty('environment');
    });
  });

  describe('integration tests', () => {
    it('should work with all health and metrics endpoints', () => {
      // Test health endpoint
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };
      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      const healthResult = controller.getHealth();
      expect(healthResult).toEqual(mockHealthResponse);

      // Test detailed health endpoint
      const mockDetailedHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        checks: {
          database: true,
          kafka: true,
          redis: true,
          memory: true,
        },
      };
      mockHealthService.getDetailedHealthStatus.mockReturnValue(mockDetailedHealthResponse);

      const detailedHealthResult = controller.getDetailedHealth();
      expect(detailedHealthResult).toEqual(mockDetailedHealthResponse);

      // Test metrics endpoint
      const mockMetrics = `# HELP api_gateway_up Service status
api_gateway_up 1`;
      mockMetricsService.generatePrometheusMetrics.mockReturnValue(mockMetrics);

      const metricsResult = controller.getMetrics();
      expect(metricsResult).toBe(mockMetrics);

      // Test smoke test endpoint
      const smokeTestResult = controller.smokeTest();
      expect(smokeTestResult.service).toBe('api-gateway');
    });

    it('should handle service errors gracefully', () => {
      // Test health service error
      mockHealthService.getHealthStatus.mockImplementation(() => {
        throw new Error('Health service unavailable');
      });

      expect(() => controller.getHealth()).toThrow('Health service unavailable');

      // Test metrics service error
      mockMetricsService.generatePrometheusMetrics.mockImplementation(() => {
        throw new Error('Metrics service unavailable');
      });

      expect(() => controller.getMetrics()).toThrow('Metrics service unavailable');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid endpoint calls', () => {
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };
      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      const mockMetrics = `# HELP api_gateway_up Service status
api_gateway_up 1`;
      mockMetricsService.generatePrometheusMetrics.mockReturnValue(mockMetrics);

      // Rapid calls to all endpoints
      for (let i = 0; i < 10; i++) {
        controller.getHealth();
        controller.getMetrics();
        controller.smokeTest();
      }

      expect(mockHealthService.getHealthStatus).toHaveBeenCalledTimes(10);
      expect(mockMetricsService.generatePrometheusMetrics).toHaveBeenCalledTimes(10);
    });

    it('should handle different timestamp formats', () => {
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };
      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      const result = controller.getHealth();
      const timestamp = new Date(result.timestamp);

      // Should handle ISO string format
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });

  describe('response validation', () => {
    it('should return valid health response structure', () => {
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
      };
      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      const result = controller.getHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });

    it('should return valid detailed health response structure', () => {
      const mockDetailedHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        checks: {
          database: true,
          kafka: true,
          redis: true,
          memory: true,
        },
      };
      mockHealthService.getDetailedHealthStatus.mockReturnValue(mockDetailedHealthResponse);

      const result = controller.getDetailedHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
      expect(typeof result.checks).toBe('object');
      expect(typeof result.checks.database).toBe('boolean');
    });

    it('should return valid smoke test response structure', () => {
      const result = controller.smokeTest();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(typeof result.message).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.service).toBe('string');
      expect(typeof result.version).toBe('string');
      expect(typeof result.environment).toBe('string');
    });
  });
});

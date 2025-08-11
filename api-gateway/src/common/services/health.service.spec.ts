import { Test, TestingModule } from '@nestjs/testing';
import { HealthService, HealthResponse, DetailedHealthResponse } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthStatus', () => {
    it('should return basic health status', () => {
      const result = service.getHealthStatus();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });

    it('should return valid timestamp', () => {
      const result = service.getHealthStatus();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should return valid uptime', () => {
      const result = service.getHealthStatus();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof result.uptime).toBe('number');
    });

    it('should always return status as ok', () => {
      const result = service.getHealthStatus();

      expect(result.status).toBe('ok');
    });
  });

  describe('getDetailedHealthStatus', () => {
    it('should return detailed health status', () => {
      const result = service.getDetailedHealthStatus();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        checks: {
          database: true,
          kafka: true,
          redis: true,
          memory: expect.any(Boolean),
        },
      });
    });

    it('should include basic health information', () => {
      const result = service.getDetailedHealthStatus();
      const basicHealth = service.getHealthStatus();

      expect(result.status).toBe(basicHealth.status);
      expect(result.timestamp).toBe(basicHealth.timestamp);
      expect(result.uptime).toBe(basicHealth.uptime);
    });

    it('should include all required health checks', () => {
      const result = service.getDetailedHealthStatus();

      expect(result.checks).toHaveProperty('database');
      expect(result.checks).toHaveProperty('kafka');
      expect(result.checks).toHaveProperty('redis');
      expect(result.checks).toHaveProperty('memory');
    });

    it('should return boolean values for all checks', () => {
      const result = service.getDetailedHealthStatus();

      Object.values(result.checks).forEach((check) => {
        expect(typeof check).toBe('boolean');
      });
    });
  });

  describe('checkMemoryHealth', () => {
    it('should return true when memory usage is below threshold', () => {
      // Mock process.memoryUsage to return low memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 100 * 1024 * 1024, // 100MB
        heapTotal: 200 * 1024 * 1024, // 200MB
        external: 50 * 1024 * 1024, // 50MB
        rss: 300 * 1024 * 1024, // 300MB
      });

      const result = (service as any).checkMemoryHealth();

      expect(result).toBe(true);
      process.memoryUsage = originalMemoryUsage;
    });

    it('should return false when memory usage exceeds threshold', () => {
      // Mock process.memoryUsage to return high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 2 * 1024 * 1024 * 1024, // 2GB
        heapTotal: 3 * 1024 * 1024 * 1024, // 3GB
        external: 1 * 1024 * 1024 * 1024, // 1GB
        rss: 4 * 1024 * 1024 * 1024, // 4GB
      });

      const result = (service as any).checkMemoryHealth();

      expect(result).toBe(false);
      process.memoryUsage = originalMemoryUsage;
    });

    it('should use correct memory threshold (1GB)', () => {
      const threshold = 1024 * 1024 * 1024; // 1GB

      // Test exactly at threshold
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: threshold,
        heapTotal: threshold * 2,
        external: threshold / 2,
        rss: threshold * 3,
      });

      const result = (service as any).checkMemoryHealth();

      expect(result).toBe(false); // Should be false when equal to threshold
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency between basic and detailed health', () => {
      const basicHealth = service.getHealthStatus();
      const detailedHealth = service.getDetailedHealthStatus();

      expect(detailedHealth.status).toBe(basicHealth.status);
      expect(detailedHealth.timestamp).toBe(basicHealth.timestamp);
      expect(detailedHealth.uptime).toBe(basicHealth.uptime);
    });

    it('should return valid response structure for all methods', () => {
      const basicHealth = service.getHealthStatus();
      const detailedHealth = service.getDetailedHealthStatus();

      // Validate basic health structure
      expect(basicHealth).toHaveProperty('status');
      expect(basicHealth).toHaveProperty('timestamp');
      expect(basicHealth).toHaveProperty('uptime');

      // Validate detailed health structure
      expect(detailedHealth).toHaveProperty('status');
      expect(detailedHealth).toHaveProperty('timestamp');
      expect(detailedHealth).toHaveProperty('uptime');
      expect(detailedHealth).toHaveProperty('checks');

      // Validate checks structure
      expect(detailedHealth.checks).toHaveProperty('database');
      expect(detailedHealth.checks).toHaveProperty('kafka');
      expect(detailedHealth.checks).toHaveProperty('redis');
      expect(detailedHealth.checks).toHaveProperty('memory');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid calls', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(service.getHealthStatus());
      }

      results.forEach((result) => {
        expect(result.status).toBe('ok');
        expect(result.timestamp).toBeDefined();
        expect(result.uptime).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle detailed health calls with different memory states', () => {
      // This test verifies that the service can handle different memory states
      // without throwing errors
      expect(() => service.getDetailedHealthStatus()).not.toThrow();

      // Multiple calls should work
      const result1 = service.getDetailedHealthStatus();
      const result2 = service.getDetailedHealthStatus();

      expect(result1.checks.memory).toBeDefined();
      expect(result2.checks.memory).toBeDefined();
      expect(typeof result1.checks.memory).toBe('boolean');
      expect(typeof result2.checks.memory).toBe('boolean');
    });
  });
});

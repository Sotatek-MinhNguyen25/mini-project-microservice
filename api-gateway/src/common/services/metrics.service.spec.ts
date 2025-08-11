import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService, MetricsData } from './metrics.service';
import { METRICS_CONSTANTS } from '../constants/metrics.constants';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('incrementRequestCount', () => {
    it('should increment request count by 1', () => {
      const initialCount = service.getRequestCount();
      service.incrementRequestCount();
      expect(service.getRequestCount()).toBe(initialCount + 1);
    });

    it('should increment multiple times correctly', () => {
      const increments = 5;
      for (let i = 0; i < increments; i++) {
        service.incrementRequestCount();
      }
      expect(service.getRequestCount()).toBe(increments);
    });

    it('should start from 0', () => {
      expect(service.getRequestCount()).toBe(0);
    });
  });

  describe('getRequestCount', () => {
    it('should return current request count', () => {
      expect(service.getRequestCount()).toBe(0);

      service.incrementRequestCount();
      expect(service.getRequestCount()).toBe(1);

      service.incrementRequestCount();
      expect(service.getRequestCount()).toBe(2);
    });
  });

  describe('getUptime', () => {
    it('should return process uptime', () => {
      const result = service.getUptime();

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return same value as process.uptime()', () => {
      const serviceUptime = service.getUptime();
      const processUptime = process.uptime();

      // Allow small difference due to timing
      expect(Math.abs(serviceUptime - processUptime)).toBeLessThan(0.1);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return process memory usage', () => {
      const result = service.getMemoryUsage();

      expect(result).toHaveProperty('heapUsed');
      expect(result).toHaveProperty('heapTotal');
      expect(result).toHaveProperty('external');
      expect(result).toHaveProperty('rss');
    });

    it('should return same value as process.memoryUsage()', () => {
      const serviceMemory = service.getMemoryUsage();
      const processMemory = process.memoryUsage();

      expect(serviceMemory.heapUsed).toBe(processMemory.heapUsed);
      expect(serviceMemory.heapTotal).toBe(processMemory.heapTotal);
      expect(serviceMemory.external).toBe(processMemory.external);
      expect(serviceMemory.rss).toBe(processMemory.rss);
    });
  });

  describe('calculateCpuUsage', () => {
    it('should return a number between 0 and 100', () => {
      const result = service.calculateCpuUsage();

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should handle rapid calls without errors', () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(service.calculateCpuUsage());
      }

      results.forEach((result) => {
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('calculateErrorRate', () => {
    it('should return 0 when no requests', () => {
      expect(service.getRequestCount()).toBe(0);
      expect(service.calculateErrorRate()).toBe(0);
    });

    it('should calculate error rate based on request count', () => {
      // Add some requests
      service.incrementRequestCount();
      service.incrementRequestCount();
      service.incrementRequestCount();

      const result = service.calculateErrorRate();

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should return rounded error rate to 2 decimal places', () => {
      service.incrementRequestCount();
      service.incrementRequestCount();

      const result = service.calculateErrorRate();
      const decimalPlaces = result.toString().split('.')[1]?.length || 0;

      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('getMetricsData', () => {
    it('should return complete metrics data', () => {
      const result = service.getMetricsData();

      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memoryUsage');
      expect(result).toHaveProperty('cpuUsage');
      expect(result).toHaveProperty('requestCount');
      expect(result).toHaveProperty('errorRate');
    });

    it('should return correct data types', () => {
      const result = service.getMetricsData();

      expect(typeof result.uptime).toBe('number');
      expect(typeof result.memoryUsage).toBe('object');
      expect(typeof result.cpuUsage).toBe('number');
      expect(typeof result.requestCount).toBe('number');
      expect(typeof result.errorRate).toBe('number');
    });

    it('should return consistent data across calls', () => {
      const result1 = service.getMetricsData();
      const result2 = service.getMetricsData();

      expect(result1.uptime).toBe(result2.uptime);
      expect(result1.requestCount).toBe(result2.requestCount);
      expect(result1.errorRate).toBe(result2.errorRate);
    });
  });

  describe('generatePrometheusMetrics', () => {
    it('should return string in Prometheus format', () => {
      const result = service.generatePrometheusMetrics();

      expect(typeof result).toBe('string');
      expect(result).toContain('# HELP');
      expect(result).toContain('# TYPE');
    });

    it('should include all required metrics', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.UP);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.UPTIME);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE);
      expect(result).toContain(METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION);
    });

    it('should include correct metric types', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain(`TYPE ${METRICS_CONSTANTS.METRIC_NAMES.UP} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}`);
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.UPTIME} ${METRICS_CONSTANTS.METRIC_TYPES.COUNTER}`,
      );
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}`,
      );
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}`,
      );
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL} ${METRICS_CONSTANTS.METRIC_TYPES.COUNTER}`,
      );
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}`,
      );
      expect(result).toContain(
        `TYPE ${METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}`,
      );
    });

    it('should include correct help text', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain(`HELP ${METRICS_CONSTANTS.METRIC_NAMES.UP} ${METRICS_CONSTANTS.METRIC_HELP.UP}`);
      expect(result).toContain(`HELP ${METRICS_CONSTANTS.METRIC_NAMES.UPTIME} ${METRICS_CONSTANTS.METRIC_HELP.UPTIME}`);
      expect(result).toContain(
        `HELP ${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE} ${METRICS_CONSTANTS.METRIC_HELP.MEMORY_USAGE}`,
      );
      expect(result).toContain(
        `HELP ${METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE} ${METRICS_CONSTANTS.METRIC_HELP.CPU_USAGE}`,
      );
      expect(result).toContain(
        `HELP ${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL} ${METRICS_CONSTANTS.METRIC_HELP.REQUESTS_TOTAL}`,
      );
      expect(result).toContain(
        `HELP ${METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE} ${METRICS_CONSTANTS.METRIC_HELP.ERROR_RATE}`,
      );
      expect(result).toContain(
        `HELP ${METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION} ${METRICS_CONSTANTS.METRIC_HELP.NODEJS_VERSION}`,
      );
    });

    it('should include memory usage with correct labels', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain('{type="rss"}');
      expect(result).toContain('{type="heapUsed"}');
      expect(result).toContain('{type="heapTotal"}');
      expect(result).toContain('{type="external"}');
    });

    it('should include request metrics with correct labels', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain('{method="GET",status="200"}');
      expect(result).toContain('{method="POST",status="200"}');
      expect(result).toContain('{method="GET",status="404"}');
      expect(result).toContain('{method="POST",status="500"}');
    });

    it('should include Node.js version info', () => {
      const result = service.generatePrometheusMetrics();

      expect(result).toContain(`{version="${process.version}"}`);
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency across all methods', () => {
      // Increment request count
      service.incrementRequestCount();
      service.incrementRequestCount();

      // Get metrics data
      const metricsData = service.getMetricsData();

      // Generate Prometheus metrics
      const prometheusMetrics = service.generatePrometheusMetrics();

      // Verify consistency
      expect(metricsData.requestCount).toBe(2);
      expect(prometheusMetrics).toContain('2');
      expect(metricsData.errorRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge cases gracefully', () => {
      // Test with no requests
      expect(service.getRequestCount()).toBe(0);
      expect(service.calculateErrorRate()).toBe(0);

      // Test with single request
      service.incrementRequestCount();
      expect(service.getRequestCount()).toBe(1);
      expect(service.calculateErrorRate()).toBeGreaterThanOrEqual(0);

      // Test with multiple requests
      service.incrementRequestCount();
      service.incrementRequestCount();
      expect(service.getRequestCount()).toBe(3);
      expect(service.calculateErrorRate()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performance tests', () => {
    it('should handle rapid metric generation', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        service.incrementRequestCount();
        service.getMetricsData();
        service.generatePrometheusMetrics();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(service.getRequestCount()).toBe(100);
    });
  });
});

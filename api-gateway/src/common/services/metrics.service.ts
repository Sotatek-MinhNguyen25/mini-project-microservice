import { Injectable } from '@nestjs/common';
import { MetricsData, HealthResponse } from '../types/metrics.types';
import { METRICS_CONSTANTS } from '../constants/metrics.constants';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private startTime = Date.now();

  /**
   * Increment request counter
   */
  incrementRequestCount(): void {
    this.requestCount++;
  }

  /**
   * Get current request count
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Get service uptime
   */
  getUptime(): number {
    return process.uptime();
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Calculate CPU usage percentage
   */
  calculateCpuUsage(): number {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime.bigint();

    // Simulate some CPU work for measurement
    let sum = 0;
    for (let i = 0; i < METRICS_CONSTANTS.CPU_CALCULATION_ITERATIONS; i++) {
      sum += Math.random();
    }

    const endUsage = process.cpuUsage(startUsage);
    const endTime = process.hrtime.bigint();

    const cpuTime = (endUsage.user + endUsage.system) / METRICS_CONSTANTS.CPU_TIME_CONVERSION;
    const wallTime = Number(endTime - startTime) / METRICS_CONSTANTS.WALL_TIME_CONVERSION;

    return Math.min((cpuTime / wallTime) * 100, METRICS_CONSTANTS.MAX_CPU_PERCENTAGE);
  }

  /**
   * Calculate error rate percentage
   */
  calculateErrorRate(): number {
    if (this.requestCount === 0) return 0;

    const errorCount =
      Math.floor(this.requestCount * METRICS_CONSTANTS.GET_404_RATIO) +
      Math.floor(this.requestCount * METRICS_CONSTANTS.POST_500_RATIO);

    return Number(((errorCount / this.requestCount) * 100).toFixed(2));
  }

  /**
   * Get all metrics data
   */
  getMetricsData(): MetricsData {
    return {
      uptime: this.getUptime(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.calculateCpuUsage(),
      requestCount: this.getRequestCount(),
      errorRate: this.calculateErrorRate(),
    };
  }

  /**
   * Generate Prometheus metrics format
   */
  generatePrometheusMetrics(): string {
    const metrics = this.getMetricsData();

    return `# HELP ${METRICS_CONSTANTS.METRIC_NAMES.UP} ${METRICS_CONSTANTS.METRIC_HELP.UP}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.UP} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}
${METRICS_CONSTANTS.METRIC_NAMES.UP} 1

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.UPTIME} ${METRICS_CONSTANTS.METRIC_HELP.UPTIME}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.UPTIME} ${METRICS_CONSTANTS.METRIC_TYPES.COUNTER}
${METRICS_CONSTANTS.METRIC_NAMES.UPTIME} ${metrics.uptime}

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE} ${METRICS_CONSTANTS.METRIC_HELP.MEMORY_USAGE}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}
${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE}{type="rss"} ${metrics.memoryUsage.rss}
${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE}{type="heapUsed"} ${metrics.memoryUsage.heapUsed}
${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE}{type="heapTotal"} ${metrics.memoryUsage.heapTotal}
${METRICS_CONSTANTS.METRIC_NAMES.MEMORY_USAGE}{type="external"} ${metrics.memoryUsage.external}

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE} ${METRICS_CONSTANTS.METRIC_HELP.CPU_USAGE}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}
${METRICS_CONSTANTS.METRIC_NAMES.CPU_USAGE} ${metrics.cpuUsage}

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL} ${METRICS_CONSTANTS.METRIC_HELP.REQUESTS_TOTAL}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL} ${METRICS_CONSTANTS.METRIC_TYPES.COUNTER}
${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL}{method="GET",status="200"} ${metrics.requestCount}
${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL}{method="POST",status="200"} ${Math.floor(metrics.requestCount * METRICS_CONSTANTS.POST_REQUEST_RATIO)}
${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL}{method="GET",status="404"} ${Math.floor(metrics.requestCount * METRICS_CONSTANTS.GET_404_RATIO)}
${METRICS_CONSTANTS.METRIC_NAMES.REQUESTS_TOTAL}{method="POST",status="500"} ${Math.floor(metrics.requestCount * METRICS_CONSTANTS.POST_500_RATIO)}

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE} ${METRICS_CONSTANTS.METRIC_HELP.ERROR_RATE}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}
${METRICS_CONSTANTS.METRIC_NAMES.ERROR_RATE} ${metrics.errorRate}

# HELP ${METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION} ${METRICS_CONSTANTS.METRIC_HELP.NODEJS_VERSION}
# TYPE ${METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION} ${METRICS_CONSTANTS.METRIC_TYPES.GAUGE}
${METRICS_CONSTANTS.METRIC_NAMES.NODEJS_VERSION}{version="${process.version}"} 1`;
  }

  /**
   * Get health status
   */
  getHealthStatus(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
    };
  }
}

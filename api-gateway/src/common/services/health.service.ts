import { Injectable } from '@nestjs/common';
import { HealthResponse } from '../types/metrics.types';

@Injectable()
export class HealthService {
  /**
   * Get basic health status
   */
  getHealthStatus(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get detailed health status with additional checks
   */
  async getDetailedHealthStatus(): Promise<HealthResponse & { checks: Record<string, boolean> }> {
    const basicHealth = this.getHealthStatus();

    // Add additional health checks here if needed
    const checks = {
      database: true, // Placeholder for database health check
      kafka: true, // Placeholder for Kafka health check
      memory: this.checkMemoryHealth(),
    };

    return {
      ...basicHealth,
      checks,
    };
  }

  /**
   * Check memory health
   */
  private checkMemoryHealth(): boolean {
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 1024 * 1024 * 1024; // 1GB threshold

    return memoryUsage.heapUsed < memoryThreshold;
  }
}

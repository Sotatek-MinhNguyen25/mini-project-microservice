import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './common/services/health.service';
import { MetricsService } from './common/services/metrics.service';

@Controller()
export class AppController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('health')
  getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('health/detailed')
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('metrics')
  getMetrics(@Res({ passthrough: true }) res: Response) {
    res.set('Content-Type', 'text/plain');
    return this.metricsService.generatePrometheusMetrics();
  }

  @Get('admin/test')
  getSmokeTest() {
    return {
      status: 'success',
      message: 'API Gateway is running',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }
}

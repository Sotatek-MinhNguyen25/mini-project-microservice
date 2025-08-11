import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { MetricsService } from 'src/common/services/metrics.service';
import { HealthService } from 'src/common/services/health.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthService: HealthService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    this.metricsService.incrementRequestCount();
    return this.healthService.getHealthStatus();
  }

  @Get('health/detailed')
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('metrics')
  getMetrics(@Res({ passthrough: true }) res: any) {
    this.metricsService.incrementRequestCount();
    res.set('Content-Type', 'text/plain');
    return this.metricsService.generatePrometheusMetrics();
  }

  @Get('admin/test')
  getSmokeTest() {
    return {
      status: 'success',
      message: 'Auth Service is running',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    };
  }
}

import { Module } from '@nestjs/common';
import { HealthService } from '../services/health.service';
import { MetricsService } from '../services/metrics.service';

@Module({
  providers: [HealthService, MetricsService],
  exports: [HealthService, MetricsService],
})
export class HealthModule {}

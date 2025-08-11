import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './services/logger.service';
import { MetricsService } from './services/metrics.service';
import { HealthService } from './services/health.service';

@Global()
@Module({
  providers: [AppLoggerService, MetricsService, HealthService],
  exports: [AppLoggerService, MetricsService, HealthService],
})
export class CommonModule {}

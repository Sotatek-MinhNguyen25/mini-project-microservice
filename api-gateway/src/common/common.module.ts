import { Module, Global } from '@nestjs/common';
import { HealthModule } from './modules/health.module';
import { AppLoggerService } from './services/logger.service';
import { KafkaClientFactory } from './kafka/kafka-client.factory';

@Global()
@Module({
  imports: [HealthModule],
  providers: [AppLoggerService, KafkaClientFactory],
  exports: [HealthModule, AppLoggerService, KafkaClientFactory],
})
export class CommonModule {}

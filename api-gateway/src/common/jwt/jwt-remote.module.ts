import { Module } from '@nestjs/common';
import { JwtAuthRemoteGuard } from './jwt-auth-remote.guard';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [JwtAuthRemoteGuard],
  exports: [JwtAuthRemoteGuard],
})
export class JwtRemoteModule {}

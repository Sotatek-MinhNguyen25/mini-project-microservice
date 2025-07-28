import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth-gateway.controller';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [AuthGatewayController],
  providers: [],
})
export class AuthGatewayModule {}

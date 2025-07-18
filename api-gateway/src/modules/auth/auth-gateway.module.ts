import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth-gateway.controller';
import { JwtStrategy } from './jwt';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [AuthGatewayController],
  providers: [JwtStrategy],
})
export class AuthGatewayModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { ConfigModule } from '@nestjs/config';
import { CustomJwtModule } from '../jwt/custom-jwt.module';
import { RedisModule } from '../redis/redis.module';
import { AuthKafkaController } from './auth-kafka.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    ConfigModule,
    CustomJwtModule,
    RedisModule,
    KafkaModule.register(['notification']),
  ],
  controllers: [AuthController, AuthKafkaController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}

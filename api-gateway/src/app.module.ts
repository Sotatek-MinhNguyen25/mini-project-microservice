import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from './configs/config.module';
import { AuthGatewayController } from './modules/auth/auth-gateway.controller';
import { AuthGatewayModule } from './modules/auth/auth-gateway.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt';

@Module({
  imports: [
    ConfigModule,
    AuthGatewayModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
})
export class AppModule { }

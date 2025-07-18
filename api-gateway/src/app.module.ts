import { Module } from '@nestjs/common';
import { ConfigModule } from './configs/config.module';
import { AuthGatewayModule } from './modules/auth/auth-gateway.module';
import { PostGatewayModule } from './modules/post/post-gateway.module';
import { UploadGatewayModule } from './modules/upload/upload-gateway.module';
import { NotificationGatewayModule } from './modules/notification/notification-gateway.module';
// import { APP_GUARD } from '@nestjs/core';
// import { JwtAuthGuard } from './modules/auth/jwt';
import { KafkaModule } from './common/kafka/kafka.module';
import { UserGatewayModule } from './modules/user/user-gateway.module';
import { JwtModule } from './modules/auth/jwt/jwt.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    AuthGatewayModule,
    PostGatewayModule,
    UploadGatewayModule,
    NotificationGatewayModule,
    UserGatewayModule,
    KafkaModule,
    JwtModule,
    RedisModule,
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAuthGuard,
  //   },
  // ],
})
export class AppModule {}

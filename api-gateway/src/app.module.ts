import { Module } from '@nestjs/common';
import { ConfigModule } from './configs/config.module';
import { AuthGatewayModule } from './modules/auth/auth-gateway.module';
import { PostGatewayModule } from './modules/post/post-gateway.module';
import { UploadGatewayModule } from './modules/upload/upload-gateway.module';
import { NotificationGatewayModule } from './modules/notification/notification-gateway.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { UserGatewayModule } from './modules/user/user-gateway.module';

import { TagGatewayModule } from './modules/tag/tag-gateway.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthRemoteGuard } from './common/jwt';
import { RolesGuard } from './common/roles/role.guard';
import { CommentGatewayModule } from './modules/comment/comment-gateway.module';
import { JwtRemoteModule } from './common/jwt/jwt-remote.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    AuthGatewayModule,
    PostGatewayModule,
    TagGatewayModule,
    CommentGatewayModule,
    UploadGatewayModule,
    NotificationGatewayModule,
    UserGatewayModule,
    KafkaModule,
    JwtRemoteModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthRemoteGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

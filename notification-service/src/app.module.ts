import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { KafkaModule } from './common/kafka/kafka.module';
import { NotificationModule } from './notification/notification.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KafkaModule,
    NotificationModule,
    SocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [],
  providers: [SocketGateway, SocketService],
  exports: [SocketService]
})
export class SocketModule { }

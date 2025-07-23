import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserKafkaController } from './user-kafka.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [AuthModule],
  controllers: [UserKafkaController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}

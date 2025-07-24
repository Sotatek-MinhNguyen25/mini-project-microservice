import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserKafkaController } from './user-kafka.controller';
import { UserRepository } from './user.repository';

@Module({
  imports: [AuthModule],
  controllers: [UserKafkaController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}

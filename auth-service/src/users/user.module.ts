import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserKafkaController } from './user-kafka.controller';
import { KafkaModule } from 'src/kafka/kafka.module';


@Module({
    imports: [
        AuthModule
    ],
    controllers: [UserKafkaController],
    providers: [UserService],
})
export class UserModule { }

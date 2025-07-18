import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryKafkaController } from '../kafka/cloudinary-kafka.controller';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryController } from './cloudinary.controller';
// import { KafkaModule } from 'src/config/kafka.module';

@Module({
  // imports: [KafkaModule],
  imports: [HttpModule],
  providers: [CloudinaryProvider, CloudinaryService],
  // controllers: [CloudinaryKafkaController],
  controllers: [CloudinaryController],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}

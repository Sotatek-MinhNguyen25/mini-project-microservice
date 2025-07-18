import { Module } from '@nestjs/common';
import { UploadGatewayController } from './upload-gateway.controller';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [UploadGatewayController],
})
export class UploadGatewayModule {}

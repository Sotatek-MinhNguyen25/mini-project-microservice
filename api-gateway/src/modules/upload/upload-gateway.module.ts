import { Module } from '@nestjs/common';
// import { UploadGatewayController } from './upload-gateway.controller';
// import { KafkaModule } from 'src/common/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UploadGatewayHTTPController } from './upload-gateway-http.controller';

@Module({
  // imports: [KafkaModule],
  imports: [HttpModule],
  // controllers: [UploadGatewayController],
  controllers: [UploadGatewayHTTPController],
})
export class UploadGatewayModule {}

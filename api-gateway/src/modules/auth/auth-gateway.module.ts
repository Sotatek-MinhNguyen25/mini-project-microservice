import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from 'src/configs/config.service';
import { AuthGatewayController } from './auth-gateway.controller';
import { JwtStrategy } from './jwt';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: config.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config.AUTH_HOST,
          port: config.AUTH_PORT,
        },
      },
    ]),
  ],
  controllers: [AuthGatewayController],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthGatewayModule { }

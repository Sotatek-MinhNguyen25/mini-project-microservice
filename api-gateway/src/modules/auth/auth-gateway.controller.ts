import { Body, Controller, Inject, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { GATEWAY_CONSTANTS } from 'src/constants/order.constant';
import { config } from 'src/configs/config.service';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from './jwt';

@Controller('/auth')
export class AuthGatewayController {
  constructor(@Inject(config.AUTH_SERVICE) private authClient: ClientProxy) { }
  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await firstValueFrom(
      this.authClient.send(
        GATEWAY_CONSTANTS.GATEWAY.CONTROLLER.AUTH_REGISTER,
        body,
      ),
    );
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await firstValueFrom(
      this.authClient.send(
        GATEWAY_CONSTANTS.GATEWAY.CONTROLLER.AUTH_LOGIN,
        body,
      ),
    );
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await firstValueFrom(
      this.authClient.send(
        GATEWAY_CONSTANTS.GATEWAY.CONTROLLER.AUTH_REFRESH_TOKEN,
        body,
      ),
    );
  }
}

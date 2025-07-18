import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './jwt/jwt.decorator';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from '../../constants/app.constants';

@Controller('auth')
@Public()
export class AuthGatewayController implements OnModuleInit {
  constructor(@Inject(KAFKA_CLIENTS.AUTH) private readonly authClient: ClientKafka) {}

  onModuleInit() {
    this.authClient.subscribeToResponseOf(KAFKA_PATTERNS.AUTH.REGISTER);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.REGISTER, body));
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.LOGIN, body));
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.REFRESH_TOKEN, body));
  }
}

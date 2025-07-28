import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Request } from 'express';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { MESSAGE } from 'src/constants/message.constants';
import { IS_PUBLIC_KEY } from './jwt.decorator';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { KAFKA_PATTERNS, KAFKA_CLIENTS } from 'src/constants/app.constants';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthRemoteGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(KAFKA_CLIENTS.AUTH) private readonly authClient: ClientKafka,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException(MESSAGE.NO_TOKEN);

    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';
    if (!token) throw new UnauthorizedException(MESSAGE.INVALID_TOKEN);

    try {
      // Gọi Auth-service để verify token
      const userPayload = await firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN, { token }));

      // Gán user vào request
      request.user = userPayload.data;
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException(MESSAGE.TOKEN_VERIFY_FAIL);
    }
  }
}

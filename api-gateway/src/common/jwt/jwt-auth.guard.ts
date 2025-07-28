import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { MESSAGE } from 'src/constants/message.constants';
import { IS_PUBLIC_KEY } from './jwt.decorator';
import { Reflector } from '@nestjs/core';
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from 'src/constants/app.constants';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(KAFKA_CLIENTS.AUTH) private client: ClientKafka
  ) { }

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
    if (!token) throw new UnauthorizedException(MESSAGE.NO_TOKEN)
    let payload: any;
    try {
      payload = await firstValueFrom(this.client.send<JwtPayload>(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN, { token }));
      console.log(payload)
      request.user = payload.data;
      return true
    } catch {
      throw new UnauthorizedException(MESSAGE.INVALID_TOKEN);
    }

  }
}

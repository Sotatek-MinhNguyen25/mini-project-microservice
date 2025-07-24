import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/common/redis/redis.service';
import { Request } from 'express';
import { JwtPayload } from 'src/common/type/jwt-payload.type';
import { MESSAGE } from 'src/constants/message.constants';
import { IS_PUBLIC_KEY } from './jwt.decorator';
import { Reflector } from '@nestjs/core';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private reflector: Reflector,
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
    let payload: JwtPayload;
    try {
      payload = this.jwtService.decode(token);
    } catch {
      throw new UnauthorizedException(MESSAGE.INVALID_TOKEN);
    }

    if (!payload || typeof payload !== 'object' || !payload.jti) {
      throw new UnauthorizedException(MESSAGE.NO_JTI);
    }

    const isValid = await this.redisService.isJtiValid(payload.jti);
    if (!isValid) throw new UnauthorizedException(MESSAGE.JTI_INVALID);

    try {
      const verified = this.jwtService.verify<JwtPayload>(token);
      request.user = verified;
      return true;
    } catch {
      throw new UnauthorizedException(MESSAGE.TOKEN_VERIFY_FAIL);
    }
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/common/redis/redis.service';
import { Request } from 'express';
import { MESSAGE } from 'src/constants/message.constants';

interface JwtPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException(MESSAGE.NO_TOKEN);

    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';
    let payload: any = null;
    try {
      payload = this.jwtService.decode(token) as JwtPayload;
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

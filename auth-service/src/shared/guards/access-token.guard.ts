import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomJwtService } from '../../jwt/custom-jwt.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from '../type/jwt.type';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const accessToken =
      req.headers['access_token'] ||
      req.headers['access-token'] ||
      req.headers['authorization'];
    if (!accessToken) {
      throw new UnauthorizedException('Missing access_token in header');
    }
    let token = accessToken as string;
    // Nếu là Bearer thì cắt chuỗi
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid access_token');
    }
    if (!payload.jti) {
      throw new UnauthorizedException('Token missing jti');
    }
    // Kiểm tra jti còn tồn tại trong Redis không
    const valid = await this.redisService.checkJti(payload.jti);
    if (!valid) {
      throw new UnauthorizedException('Token expired or revoked');
    }
    // Gán user vào req.user để controller sử dụng
    (req as any).user = payload;
    return true;
  }
}

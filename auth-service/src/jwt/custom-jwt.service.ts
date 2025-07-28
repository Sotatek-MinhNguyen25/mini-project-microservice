import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../shared/type/jwt.type';
import { randomUUID } from 'crypto';

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) { }

  createAT(payload: JwtPayload): {
    accessToken: string;
    expiresIn: string;
    jti: string;
  } {
    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m';
    const jti = randomUUID();
    const accessToken = this.nestJwtService.sign(
      { ...payload, jti },
      { expiresIn },
    );
    return { accessToken, expiresIn, jti };
  }

  createRT(payload: JwtPayload): {
    refreshToken: string;
    expiresIn: string;
    jti: string;
  } {
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const jti = randomUUID();
    const refreshToken = this.nestJwtService.sign(
      { ...payload, jti },
      { expiresIn },
    );
    return { refreshToken, expiresIn, jti };
  }

  verify<T extends object = any>(token: string): T {
    return this.nestJwtService.verify<T>(token);
  }

  decode<T extends object = any>(token: string): T {
    return this.nestJwtService.decode<T>(token);
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from '../shared/type/jwt.type';
import { randomUUID } from 'crypto';

@Injectable()
export class JwtService extends NestJwtService {
  createAT(payload: JwtPayload): {
    accessToken: string;
    expiresIn: string;
    jti: string;
  } {
    const expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
    const jti = randomUUID();
    const accessToken = this.sign({ ...payload, jti }, { expiresIn });
    return { accessToken, expiresIn, jti };
  }

  createRT(payload: JwtPayload): {
    refreshToken: string;
    expiresIn: string;
    jti: string;
  } {
    const expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';
    const jti = randomUUID();
    const refreshToken = this.sign({ ...payload, jti }, { expiresIn });
    return { refreshToken, expiresIn, jti };
  }
}

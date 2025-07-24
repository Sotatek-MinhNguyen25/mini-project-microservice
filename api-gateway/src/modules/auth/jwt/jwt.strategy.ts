import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from '../../user/interface/user.interface';
import { JWT_CONSTANTS } from '../../../constants/app.constants';
import { config } from '../../../configs/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_CONSTANTS.STRATEGY_NAME) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  validate(payload: IUser): IUser {
    if (!payload.userId || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}

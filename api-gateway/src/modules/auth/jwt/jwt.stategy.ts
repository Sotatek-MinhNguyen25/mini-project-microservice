import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

import { config } from 'src/configs/config.service';
import { IUser } from '../user.interface';
import { ClientProxy } from '@nestjs/microservices';
import { GATEWAY_CONSTANTS } from 'src/constants/order.constant';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(config.AUTH_SERVICE) private readonly clientAuth: ClientProxy
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.JWT_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: IUser) {
        const { userId, email } = payload;
        if (!userId || !email) {
            throw new UnauthorizedException('ACCESS_TOKEN.INVALID');
        }

        try {
            const foundUser = await firstValueFrom(this.clientAuth.send(GATEWAY_CONSTANTS.GATEWAY.SERVICE.AUTH.CHECK_USER, { userId, email }))
            if (!foundUser) throw new UnauthorizedException("ACCESS_TOKEN.USER_NOT_FOUND")
            const user: IUser = payload;
            return user;
        } catch (error) {
            throw new UnauthorizedException("ACCESS_TOKEN.USER_CHECK_FAILED")
        }

    }

}
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/modules/auth/user.interface';

export const AuthUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): IUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

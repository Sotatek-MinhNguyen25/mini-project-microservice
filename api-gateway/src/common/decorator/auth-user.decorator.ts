import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/modules/user/interface/user.interface';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): IUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

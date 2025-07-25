import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard';

export function RequireAccessToken() {
  return applyDecorators(UseGuards(AccessTokenGuard));
}

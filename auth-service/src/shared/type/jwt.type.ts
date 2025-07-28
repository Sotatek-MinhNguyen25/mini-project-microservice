import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: string; // userId
  email: string;
  username: string;
  roles?: Role[];
  jti?: string; // Unique token id
  iat?: number; // Issued at
  exp?: number; // Expiration time
};

export type JwtResponse = {
  accessToken: string;
  refreshToken: string;

  // Thêm các trường khác nếu cần
};

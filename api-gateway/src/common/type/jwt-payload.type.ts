export type JwtPayload = {
  sub: string; // userId
  email: string;
  username: string;
  roles?: string[];
  jti?: string; // Unique token id
  // Thêm các trường khác nếu cần
};

export type JwtResponse = {
  accessToken: string;
  refreshToken: string;
  // Thêm các trường khác nếu cần
};

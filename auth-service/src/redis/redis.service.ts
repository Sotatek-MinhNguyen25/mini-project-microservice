import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { OTP_STATUS, OtpPurpose, OtpStatus } from 'src/auth/auth.constant';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD || undefined;
    const redisUsername = process.env.REDIS_USERNAME || 'default';
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      this.redisClient = new Redis(redisUrl, {
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        username: redisUsername,
        password: redisPassword,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  async setJti(jti: string, ttlSeconds: number): Promise<'OK' | null> {
    return this.redisClient.set(jti, '1', 'EX', ttlSeconds);
  }

  async checkJti(jti: string): Promise<boolean> {
    const exists = await this.redisClient.exists(jti);
    return exists === 1;
  }

  async delJti(jti: string): Promise<number> {
    return this.redisClient.del(jti);
  }

  // --- Quản lý set jti theo user ---
  private getUserJtiSetKey(userId: string) {
    return `user_jtis:${userId}`;
  }

  async addJtiToUserSet(userId: string, jti: string, ttlSeconds: number) {
    const setKey = this.getUserJtiSetKey(userId);
    await this.redisClient.sadd(setKey, jti);
    await this.redisClient.expire(setKey, ttlSeconds);
  }

  async getUserJtis(userId: string): Promise<string[]> {
    const setKey = this.getUserJtiSetKey(userId);
    return this.redisClient.smembers(setKey);
  }

  async removeJtiFromUserSet(userId: string, jti: string) {
    const setKey = this.getUserJtiSetKey(userId);
    await this.redisClient.srem(setKey, jti);
  }

  async revokeAllUserJtis(userId: string) {
    const setKey = this.getUserJtiSetKey(userId);
    const jtis = await this.redisClient.smembers(setKey);
    if (jtis.length > 0) {
      await this.redisClient.del(...jtis);
    }
    await this.redisClient.del(setKey);
  }

  // --- Quản lý OTP ---
  // Tạo OTP mới, xóa OTP cũ nếu có, đảm bảo không trùng toàn hệ thống
  async createForgotOtp(email: string, purpose: OtpPurpose, ttl: number) {
    // Xóa OTP cũ nếu có
    await this.redisClient.del(`otp:${email}:${purpose}`);
    let otp: string;
    do {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    } while (await this.redisClient.exists(`otp_code:${otp}`));
    const data = {
      otp,
      status: OTP_STATUS.CREATED,
      createdAt: new Date().toISOString(),
    };
    await this.redisClient.set(
      `otp:${email}:${purpose}`,
      JSON.stringify(data),
      'EX',
      ttl,
    );
    await this.redisClient.set(`otp_code:${otp}`, email, 'EX', ttl);
    return otp;
  }

  async setForgotOtp(
    email: string,
    otp: string,
    data: any,
    ttlSeconds: number,
  ) {
    const key = `otp:${email}:${otp}`;
    await this.redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  }

  async getOtp(email: string, purpose: OtpPurpose) {
    const val = await this.redisClient.get(`otp:${email}:${purpose}`);
    return val ? JSON.parse(val) : null;
  }

  async updateOtpStatus(email: string, purpose: OtpPurpose, status: OtpStatus) {
    const key = `otp:${email}:${purpose}`;
    const val = await this.redisClient.get(key);
    if (!val) return null;
    const data = JSON.parse(val);
    data.status = status;
    await this.redisClient.set(
      key,
      JSON.stringify(data),
      'EX',
      await this.redisClient.ttl(key),
    );
  }

  async deleteOtp(email: string, purpose: OtpPurpose, otp: string) {
    await this.redisClient.del(`otp:${email}:${purpose}`);
    await this.redisClient.del(`otp_code:${otp}`);
  }

  async checkOtpExists(email: string, otp: string) {
    const key = `otp:${email}:${otp}`;
    const exists = await this.redisClient.exists(key);
    return exists === 1;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async isJtiValid(jti: string): Promise<boolean> {
    const exists = await this.redisClient.exists(jti);
    return !!exists;
  }
}

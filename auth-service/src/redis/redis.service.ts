import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
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

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}

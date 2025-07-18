import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async isJtiValid(jti: string): Promise<boolean> {
    const exists = await this.client.exists(jti);
    return !!exists;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}

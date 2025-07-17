import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConfigService {
  HOST = process.env.HOST || '127.0.0.1';
  PORT = parseInt(process.env.PORT || '8000');
  // Common default
  private readonly DEFAULT_HOST = '127.0.0.1';

  readonly API_PREFIX = process.env.API_PREFIX || 'api/v1';

  // ORDER
  readonly ORDER_SERVICE = process.env.ORDER_SERVICE || 'ORDER_SERVICE';
  readonly ORDER_HOST = process.env.ORDER_HOST || this.DEFAULT_HOST;
  readonly ORDER_PORT = parseInt(process.env.ORDER_PORT || '8001', 10);

  // PAYMENT
  readonly PAYMENT_SERVICE = process.env.PAYMENT_SERVICE || 'PAYMENT_SERVICE';
  readonly PAYMENT_HOST = process.env.PAYMENT_HOST || this.DEFAULT_HOST;
  readonly PAYMENT_PORT = parseInt(process.env.PAYMENT_PORT || '8002', 10);

  // NOTIFICATION
  readonly NOTIFICATION_SERVICE =
    process.env.NOTIFICATION_SERVICE || 'NOTIFICATION_SERVICE';
  readonly NOTIFICATION_HOST =
    process.env.NOTIFICATION_HOST || this.DEFAULT_HOST;
  readonly NOTIFICATION_PORT = parseInt(
    process.env.NOTIFICATION_PORT || '8003',
    10,
  );

  readonly AUTH_SERVICE = process.env.AUTH_SERVICE || 'AUTH_SERVICE';
  readonly AUTH_HOST = process.env.AUTH_HOST || this.DEFAULT_HOST;
  readonly AUTH_PORT = parseInt(process.env.AUTH_PORT || '8004', 10);

  JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
  AC_TOKEN_EXPIRED = process.env.AC_TOKEN_EXPIRED || '3d';
  RF_TOKEN_EXPIRED = process.env.RF_TOKEN_EXPIRED || '7d';

  // Other shared configs (optional)
  readonly ENV = process.env.NODE_ENV || 'development';

  // Port Service config
  readonly POST_SERVICE_NAME = process.env.POST_SERVICE_NAME || 'POST_SERVICE';
  readonly KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:29092';
}

export const config = new ConfigService();

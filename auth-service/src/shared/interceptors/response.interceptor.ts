import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RESPONSE_METADATA_KEY,
  ResponseOptions,
} from '../decorators/response.decorator';

export interface ResponseData<T = any> {
  data?: T;
  message?: string;
  statusCode: number;
}

export function formatResponse<T>(
  data: any,
  responseOptions?: ResponseOptions,
): ResponseData<T> {
  return {
    statusCode: responseOptions?.status || HttpStatus.OK,
    data, // luôn là object trả về từ handler
    message:
      typeof responseOptions?.message === 'string'
        ? responseOptions.message
        : responseOptions?.message
          ? JSON.stringify(responseOptions.message)
          : undefined,
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    const responseOptions = this.reflector.get<ResponseOptions>(
      RESPONSE_METADATA_KEY,
      context.getHandler(),
    );
    return next.handle().pipe(
      map((data) => {
        const response = formatResponse<T>(data, responseOptions);
        // Set the status code on the response object (only for HTTP)
        const responseObj = context.switchToHttp().getResponse?.();
        if (responseObj && responseObj.status) {
          responseObj.status(response.statusCode);
        }
        return response;
      }),
    );
  }
}

// Interceptor cho microservice (Kafka)
// Đặt ở cuối file, chỉ import lại nếu cần, dùng import type để tránh duplicate
// Không lặp lại import các symbol đã có ở đầu file

export class KafkaResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    const responseOptions = this.reflector.get<ResponseOptions>(
      RESPONSE_METADATA_KEY,
      context.getHandler(),
    );
    console.log('[AUTH-SERVICE] responseOptions:', responseOptions);
    return next.handle().pipe(
      map((data) => {
        console.log('[AUTH-SERVICE] Raw handler data:', data);
        const formatted = formatResponse<T>(data, responseOptions);
        console.log('[AUTH-SERVICE] Formatted responseg', formatted);
        return formatted;
      }),
    );
  }
}

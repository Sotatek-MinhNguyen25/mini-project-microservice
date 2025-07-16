import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResponseMessageInterceptor implements NestInterceptor {
  constructor(private reflect: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const responseMessage = this.reflect.get<string>(
      'response_message',
      context.getHandler(),
    );
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((response) => ({
        status: 'success',
        statusCode: 200 | statusCode,
        message: responseMessage || '',
        data: response.data || {},
        meta: response.meta || {},
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

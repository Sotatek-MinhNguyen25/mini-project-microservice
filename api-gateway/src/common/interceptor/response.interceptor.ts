import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResponseMessageInterceptor implements NestInterceptor {
  constructor(private reflect: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const responseMessage = this.reflect.get<string>('response_message', context.getHandler());
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((response) => {
        console.log('[Gateway] Raw response from service:', response);
        const transformed = {
          status: 'success',
          statusCode: statusCode || 200,
          message: response.message || responseMessage || '',
          data: response.data !== undefined ? response.data : response,
          meta: response.meta || {},
          timestamp: new Date().toISOString(),
        };
        console.log('[Gateway] Transformed response:', transformed);
        return transformed;
      }),
    );
  }
}

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
        console.log('[ResponseInterceptor] Raw microservice response:', response);
        // Nếu response đã chuẩn (có data, message, statusCode) thì unwrap
        let resObj;
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          'message' in response &&
          'statusCode' in response
        ) {
          resObj = {
            status: 'success',
            statusCode: response.statusCode,
            message: response.message,
            code: response.statusCode,
            data: response.data,
            meta: response.meta || {},
            timestamp: new Date().toISOString(),
          };
          console.log('[ResponseInterceptor] Unwrapped response:', resObj);
        } else {
          resObj = {
            status: 'success',
            statusCode: statusCode,
            message: responseMessage || 'Request was successful',
            code: 200,
            data: response,
            meta: {},
            timestamp: new Date().toISOString(),
          };
          console.log('[ResponseInterceptor] Wrapped response:', resObj);
        }
        return resObj;
      }),
    );
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_METADATA_KEY, ResponseOptions } from '../decorators/response.decorator';

export interface ResponseData<T = any> {
  data?: T;
  message?: string;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseData<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseData<T>> {
    const responseOptions = this.reflector.get<ResponseOptions>(RESPONSE_METADATA_KEY, context.getHandler());

    return next.handle().pipe(
      map((data) => {
        const response: ResponseData<T> = {
          statusCode: responseOptions?.status || HttpStatus.OK,
          data,
        };

        if (responseOptions?.message) {
          response.message =
            typeof responseOptions.message === 'string'
              ? responseOptions.message
              : JSON.stringify(responseOptions.message);
        }

        // Set the status code on the response object
        const responseObj = context.switchToHttp().getResponse();
        responseObj.status(response.statusCode);

        return response;
      }),
    );
  }
}

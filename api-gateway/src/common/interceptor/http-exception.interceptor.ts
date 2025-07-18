import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';

@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err.isAxiosError) {
          const axiosError = err as AxiosError<any>;
          const response = axiosError.response;

          const status = response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
          const message = response?.data?.message || 'Internal service error';
          const error = response?.data?.error || HttpStatus[status] || 'Error';

          return throwError(() => new HttpException({ message, error, statusCode: status }, status));
        }

        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        return throwError(
          () =>
            new HttpException(
              {
                message: 'GATEWAY.UNHANDLED_ERROR',
                error: 'Internal Server Error',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}

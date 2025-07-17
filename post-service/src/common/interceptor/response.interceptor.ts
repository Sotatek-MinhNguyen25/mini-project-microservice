import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = response.statusCode;
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: statusCode || 200,
        result: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

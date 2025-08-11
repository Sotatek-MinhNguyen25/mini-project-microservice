import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class RequestCounterInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Increment request counter before processing
    this.metricsService.incrementRequestCount();

    return next.handle().pipe(
      tap(() => {
        // Additional logic after request processing if needed
      }),
    );
  }
}

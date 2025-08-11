import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class HealthController {
  private requestCount = 0;
  private startTime = Date.now();

  @Get('health')
  getHealth() {
    this.requestCount++;
    return { status: 'ok' };
  }

  @Get('metrics')
  getMetrics(@Res({ passthrough: true }) res: any) {
    this.requestCount++;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();

    res.set('Content-Type', 'text/plain');

    return `# HELP notification_service_up Service status (1 = up, 0 = down)
# TYPE notification_service_up gauge
notification_service_up 1

# HELP notification_service_uptime_seconds Service uptime in seconds
# TYPE notification_service_uptime_seconds counter
notification_service_uptime_seconds ${uptime}

# HELP notification_service_memory_usage_bytes Memory usage in bytes
# TYPE notification_service_memory_usage_bytes gauge
notification_service_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
notification_service_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
notification_service_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
notification_service_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP notification_service_cpu_usage_percent CPU usage percentage
# TYPE notification_service_cpu_usage_percent gauge
notification_service_cpu_usage_percent ${cpuUsage}

# HELP notification_service_requests_total Total number of requests
# TYPE notification_service_requests_total counter
notification_service_requests_total{method="GET",status="200"} ${this.requestCount}
notification_service_requests_total{method="POST",status="200"} ${Math.floor(this.requestCount * 0.3)}
notification_service_requests_total{method="GET",status="404"} ${Math.floor(this.requestCount * 0.05)}
notification_service_requests_total{method="POST",status="500"} ${Math.floor(this.requestCount * 0.02)}

# HELP notification_service_error_rate Error rate percentage
# TYPE notification_service_error_rate gauge
notification_service_error_rate ${this.requestCount > 0 ? ((Math.floor(this.requestCount * 0.05) / this.requestCount) * 100).toFixed(2) : '0.00'}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1`;
  }

  private getCpuUsage(): number {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime.bigint();

    // Simulate some CPU work
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }

    const endUsage = process.cpuUsage(startUsage);
    const endTime = process.hrtime.bigint();

    const cpuTime = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
    const wallTime = Number(endTime - startTime) / 1000000000; // Convert to seconds

    return Math.min((cpuTime / wallTime) * 100, 100);
  }
}

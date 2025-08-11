export interface MetricsData {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  requestCount: number;
  errorRate: number;
}

export interface PrometheusMetrics {
  up: number;
  uptimeSeconds: number;
  memoryUsageBytes: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsagePercent: number;
  requestsTotal: {
    get200: number;
    post200: number;
    get404: number;
    post500: number;
  };
  errorRate: number;
  nodejsVersion: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

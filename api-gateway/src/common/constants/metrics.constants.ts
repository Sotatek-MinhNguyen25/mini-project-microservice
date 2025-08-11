export const METRICS_CONSTANTS = {
  // Request distribution ratios
  POST_REQUEST_RATIO: 0.3,
  GET_404_RATIO: 0.05,
  POST_500_RATIO: 0.02,

  // CPU calculation
  CPU_CALCULATION_ITERATIONS: 1000000,
  CPU_TIME_CONVERSION: 1000000, // Convert microseconds to seconds
  WALL_TIME_CONVERSION: 1000000000, // Convert nanoseconds to seconds
  MAX_CPU_PERCENTAGE: 100,

  // Prometheus metric names
  METRIC_NAMES: {
    UP: 'api_gateway_up',
    UPTIME: 'api_gateway_uptime_seconds',
    MEMORY_USAGE: 'api_gateway_memory_usage_bytes',
    CPU_USAGE: 'api_gateway_cpu_usage_percent',
    REQUESTS_TOTAL: 'api_gateway_requests_total',
    ERROR_RATE: 'api_gateway_error_rate',
    NODEJS_VERSION: 'nodejs_version_info',
  },

  // Prometheus metric types
  METRIC_TYPES: {
    GAUGE: 'gauge',
    COUNTER: 'counter',
  },

  // Prometheus metric help text
  METRIC_HELP: {
    UP: 'Service status (1 = up, 0 = down)',
    UPTIME: 'Service uptime in seconds',
    MEMORY_USAGE: 'Memory usage in bytes',
    CPU_USAGE: 'CPU usage percentage',
    REQUESTS_TOTAL: 'Total number of requests',
    ERROR_RATE: 'Error rate percentage',
    NODEJS_VERSION: 'Node.js version info',
  },
} as const;

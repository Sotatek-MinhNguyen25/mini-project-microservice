export const APP_CONSTANTS = {
  // CPU calculation constants
  CPU: {
    CALCULATION_ITERATIONS: 1000000,
    TIME_CONVERSION: 1000000, // Convert microseconds to seconds
    WALL_TIME_CONVERSION: 1000000000, // Convert nanoseconds to seconds
    MAX_PERCENTAGE: 100,
  },

  // Metrics constants
  METRICS: {
    POST_REQUEST_RATIO: 0.3,
    GET_404_RATIO: 0.05,
    POST_500_RATIO: 0.02,
    ERROR_RATE_MULTIPLIER: 100,
  },

  // Security constants
  SECURITY: {
    BCRYPT_ROUNDS: 10,
    DEFAULT_PAGE_LIMIT: 10,
  },

  // Time constants
  TIME: {
    DEFAULT_OTP_TTL: 300, // 5 minutes
    DEFAULT_FORGOT_OTP_TTL: 300, // 5 minutes
    MILLISECONDS_IN_SECOND: 1000,
    SECONDS_IN_MINUTE: 60,
    MINUTES_IN_HOUR: 60,
    HOURS_IN_DAY: 24,
  },

  // Memory constants
  MEMORY: {
    THRESHOLD_1GB: 1024 * 1024 * 1024,
  },
} as const;

export const METRICS_CONSTANTS = {
  // Prometheus metric names
  METRIC_NAMES: {
    UP: 'auth_service_up',
    UPTIME: 'auth_service_uptime_seconds',
    MEMORY_USAGE: 'auth_service_memory_usage_bytes',
    CPU_USAGE: 'auth_service_cpu_usage_percent',
    REQUESTS_TOTAL: 'auth_service_requests_total',
    ERROR_RATE: 'auth_service_error_rate',
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

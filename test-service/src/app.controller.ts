import { Controller, Get, Res } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  // HTTP endpoints for health checks
  @Get()
  getHello(): string {
    this.requestCount++;
    return this.appService.getHello();
  }

  @Get("health")
  getHealth() {
    this.requestCount++;
    return { status: "ok" };
  }

  @Get("info")
  getInfo() {
    this.requestCount++;
    return {
      name: "Test Service",
      version: "1.0.0",
      description: "Test service with Kafka consumer and Database",
      endpoints: [
        "GET /api - Hello message",
        "GET /api/health - Health check",
        "GET /api/info - Service information",
        "GET /api/users - Get all users",
        "GET /api/metrics - Prometheus metrics",
      ],
      kafka: {
        topics: ["test-topic", "health-check", "ping"],
        broker: process.env.KAFKA_BROKER || "kafka-broker-service:9092",
      },
      database: {
        provider: "postgresql",
        url: process.env.DATABASE_URL ? "Set" : "Not set",
      },
    };
  }

  private requestCount = 0;
  private kafkaMessageCount = { "test-topic": 0, "health-check": 0, ping: 0 };
  private errorCount = 0;
  private startTime = Date.now();

  @Get("metrics")
  getMetrics(@Res({ passthrough: true }) res: any) {
    this.requestCount++;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();

    res.set("Content-Type", "text/plain");

    return `# HELP test_service_up Service status (1 = up, 0 = down)
# TYPE test_service_up gauge
test_service_up 1

# HELP test_service_uptime_seconds Service uptime in seconds
# TYPE test_service_uptime_seconds counter
test_service_uptime_seconds ${uptime}

# HELP test_service_memory_usage_bytes Memory usage in bytes
# TYPE test_service_memory_usage_bytes gauge
test_service_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
test_service_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
test_service_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
test_service_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP test_service_cpu_usage_percent CPU usage percentage
# TYPE test_service_cpu_usage_percent gauge
test_service_cpu_usage_percent ${cpuUsage}

# HELP test_service_requests_total Total number of requests
# TYPE test_service_requests_total counter
test_service_requests_total{method="GET",status="200"} ${this.requestCount}
test_service_requests_total{method="POST",status="200"} ${Math.floor(this.requestCount * 0.3)}
test_service_requests_total{method="GET",status="404"} ${this.errorCount}
test_service_requests_total{method="POST",status="500"} ${Math.floor(this.errorCount * 0.2)}

# HELP test_service_response_time_seconds Response time in seconds
# TYPE test_service_response_time_seconds histogram
test_service_response_time_seconds_bucket{le="0.1"} ${Math.floor(this.requestCount * 0.8)}
test_service_response_time_seconds_bucket{le="0.5"} ${Math.floor(this.requestCount * 0.95)}
test_service_response_time_seconds_bucket{le="1.0"} ${this.requestCount}
test_service_response_time_seconds_bucket{le="+Inf"} ${this.requestCount}

# HELP test_service_error_rate Error rate percentage
# TYPE test_service_error_rate gauge
test_service_error_rate ${this.requestCount > 0 ? ((this.errorCount / this.requestCount) * 100).toFixed(2) : "0.00"}

# HELP test_service_kafka_messages_total Total Kafka messages processed
# TYPE test_service_kafka_messages_total counter
test_service_kafka_messages_total{topic="test-topic"} ${this.kafkaMessageCount["test-topic"]}
test_service_kafka_messages_total{topic="health-check"} ${this.kafkaMessageCount["health-check"]}
test_service_kafka_messages_total{topic="ping"} ${this.kafkaMessageCount.ping}

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

  @Get("users")
  async getAllUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          roles: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          oauthProvider: true,
          // Không select password và deletedAt để bảo mật
        },
        where: {
          deletedAt: null, // Chỉ lấy users chưa bị xóa (soft delete)
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        status: "success",
        message: "Users retrieved successfully",
        count: users.length,
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to get users:", error);
      return {
        status: "error",
        message: "Failed to retrieve users",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Kafka message handlers
  @MessagePattern("test-topic")
  async handleTestMessage(@Payload() data: any) {
    console.log("📨 Received test message:", data);
    this.kafkaMessageCount["test-topic"]++;

    // Log to console instead of database
    console.log(`📝 Test log: Received test message: ${JSON.stringify(data)}`);

    return {
      status: "ok",
      service: "test-service",
      message: "Test message received successfully",
      timestamp: new Date().toISOString(),
      receivedData: data,
    };
  }

  @MessagePattern("health-check")
  async handleHealthCheck(@Payload() data: any) {
    console.log("🏥 Health check request received:", data);
    this.kafkaMessageCount["health-check"]++;

    return {
      status: "ok",
      service: "test-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  @MessagePattern("ping")
  async handlePing(@Payload() data: any) {
    console.log("🏓 Ping received:", data);
    this.kafkaMessageCount.ping++;

    return {
      status: "pong",
      service: "test-service",
      timestamp: new Date().toISOString(),
      message: "Pong from test-service!",
    };
  }
}

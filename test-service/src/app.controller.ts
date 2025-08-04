import { Controller, Get } from "@nestjs/common";
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
    return this.appService.getHello();
  }

  @Get("health")
  async getHealth() {
    let dbStatus = "unknown";
    let userCount = 0;

    try {
      // Test database connection
      await this.prismaService.$connect();
      userCount = await this.prismaService.user.count();
      dbStatus = "connected";
    } catch (error) {
      dbStatus = "error";
      console.error("Database health check failed:", error);
    }

    return {
      status: "ok",
      service: "test-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      kafka: "connected",
      database: {
        status: dbStatus,
        userCount: userCount,
      },
    };
  }

  @Get("info")
  getInfo() {
    return {
      name: "Test Service",
      version: "1.0.0",
      description: "Test service with Kafka consumer and Database",
      endpoints: [
        "GET /api - Hello message",
        "GET /api/health - Health check",
        "GET /api/info - Service information",
        "GET /api/users - Get all users",
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
    return {
      status: "pong",
      service: "test-service",
      timestamp: new Date().toISOString(),
      message: "Pong from test-service!",
    };
  }
}

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

dotenv.config();

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Create HTTP app for health checks
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix("api");

  // Get Prisma service
  const prismaService = app.get(PrismaService);

  // Test database connection
  try {
    await prismaService.$connect();
    logger.log("✅ Database connection test successful");

    // Test a simple query
    const userCount = await prismaService.user.count();
    logger.log(`📊 Database test: Found ${userCount} users`);

    // Log test service start
    logger.log(`📝 Test service started successfully`);
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    throw error;
  }

  // Create Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: "test-service-client",
          brokers: [process.env.KAFKA_BROKERS ?? "kafka-broker-service:9092"],
        },
        consumer: {
          groupId: "test-service-consumer-group",
        },
      },
    }
  );

  // Enable shutdown hooks for Prisma
  prismaService.enableShutdownHooks(app);

  // Start both HTTP server and Kafka consumer
  const port = process.env.PORT || 3010;
  await app.listen(port);
  await kafkaApp.listen();

  logger.log(`🚀 Test Service is running on: http://localhost:${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/api/health`);
  logger.log(`📨 Kafka Microservice is listening for messages.`);

  const kafkaBrokers = process.env.KAFKA_BROKER ?? "kafka-broker-service:9092";
  logger.log(`[TEST-SERVICE] KAFKA_BROKER: ${kafkaBrokers}`);
  logger.log(
    `[TEST-SERVICE] DATABASE_URL: ${process.env.DATABASE_URL ? "Set" : "Not set"}`
  );

  // Keep the service running
  await new Promise((resolve) => {});
}

bootstrap();

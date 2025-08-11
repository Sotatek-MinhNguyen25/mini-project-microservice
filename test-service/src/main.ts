import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // HTTP app for health checks
  const httpApp = await NestFactory.create(AppModule);
  const prismaService = httpApp.get(PrismaService);
  prismaService.enableShutdownHooks(httpApp);
  await httpApp.listen(process.env.PORT || 3010);
  logger.log(`🚀 HTTP server is running on port: ${process.env.PORT || 3010}`);

  // Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: "test-service-client",
          brokers: [process.env.KAFKA_BROKER ?? "kafka-broker-service:9092"],
        },
        consumer: {
          groupId: "test-service-consumer-group",
        },
      },
    }
  );
  await kafkaApp.listen();
  logger.log(`🚀 Kafka Microservice is running and listening for messages.`);
}

bootstrap();

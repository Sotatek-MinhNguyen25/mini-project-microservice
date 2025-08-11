import { OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export abstract class BaseGatewayController implements OnModuleInit {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('KAFKA_CLIENT') protected readonly kafkaClient: ClientKafka,
    protected readonly patterns: string[],
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Subscribe to all patterns
      this.patterns.forEach((pattern) => {
        this.kafkaClient.subscribeToResponseOf(pattern);
      });

      // Connect to Kafka
      await this.kafkaClient.connect();
      this.logger.log(`Connected to Kafka and subscribed to ${this.patterns.length} patterns`);
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka connection: ${error.message}`);
      throw error;
    }
  }

  protected logRequest(method: string, endpoint: string, userId?: string): void {
    this.logger.log(`${method} ${endpoint}${userId ? ` - User: ${userId}` : ''}`);
  }

  protected logError(method: string, endpoint: string, error: any): void {
    this.logger.error(`${method} ${endpoint} failed: ${error.message}`, error.stack);
  }
}

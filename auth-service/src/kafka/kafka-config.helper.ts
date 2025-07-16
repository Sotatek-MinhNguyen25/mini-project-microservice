// kafka-config.helper.ts
import { Injectable } from '@nestjs/common';
import { Transport, ClientOptions, MicroserviceOptions } from '@nestjs/microservices';

@Injectable()
export class KafkaConfigHelper {
  createConfigKafka(serviceName: string): ClientOptions {
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `${serviceName}-client`,
          brokers: [process.env.KAFKA_BROKER || 'kafka:9093'],
        },
        consumer: {
          groupId: `${serviceName}-consumer-group`,
          allowAutoTopicCreation: true,
          heartbeatInterval: 2000,
        },
      },
    };
  }
}

// Utility function để tạo cấu hình cho app.connectMicroservice()
export function createKafkaConnectConfig(
  serviceName: string,
  brokers: string[],
): MicroserviceOptions {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${serviceName}-main-consumer-client`,
        brokers: brokers,
      },
      consumer: {
        groupId: `${serviceName}-results-consumer-group-v2`,
        allowAutoTopicCreation: true,
        heartbeatInterval: 2000,
      },
    },
  };
}

import { Injectable } from '@nestjs/common';
import { ClientKafka, Transport } from '@nestjs/microservices';
import { config } from '../../configs/configuration';

export interface KafkaClientConfig {
  name: string;
  clientId: string;
  groupId?: string;
}

@Injectable()
export class KafkaClientFactory {
  createClient(config: KafkaClientConfig): ClientKafka {
    const kafkaConfig = {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [config.clientId],
          clientId: config.clientId,
        },
        ...(config.groupId && {
          consumer: {
            groupId: config.groupId,
          },
        }),
      },
    };

    return new ClientKafka(kafkaConfig.options);
  }

  getDefaultConfigs() {
    const baseConfig = {
      brokers: config.kafka.brokers,
      baseClientId: config.kafka.clientId,
      baseGroupId: config.kafka.groupId,
    };

    return {
      AUTH: {
        name: 'AUTH_CLIENT',
        clientId: `${baseConfig.baseClientId}-auth`,
        groupId: `${baseConfig.baseGroupId}-auth`,
      },
      POST: {
        name: 'POST_CLIENT',
        clientId: `${baseConfig.baseClientId}-post`,
        groupId: `${baseConfig.baseGroupId}-post`,
      },
      UPLOAD: {
        name: 'UPLOAD_CLIENT',
        clientId: `${baseConfig.baseClientId}-upload`,
        groupId: `${baseConfig.baseGroupId}-upload`,
      },
      NOTIFICATION: {
        name: 'NOTIFICATION_CLIENT',
        clientId: `${baseConfig.baseClientId}-notification`,
        groupId: `${baseConfig.baseGroupId}-notification`,
      },
    };
  }
}

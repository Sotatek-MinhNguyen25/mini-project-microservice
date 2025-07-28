// kafka.module.ts
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { KafkaConfigHelper } from './kafka-config.helper'; // Adjust the import path as necessary';
import { KafkaService } from './kafka.service';

@Global()
@Module({})
export class KafkaModule {
  static register(serviceNames: string[]): DynamicModule {
    const kafkaProviders: Provider[] = serviceNames.map((name) => ({
      provide: `KAFKA_${name.toUpperCase()}_SERVICE`,
      useFactory: (helper: KafkaConfigHelper) => {
        const config = helper.createConfigKafka(name.toLowerCase());
        return ClientProxyFactory.create(config);
      },
      inject: [KafkaConfigHelper],
    }));

    return {
      module: KafkaModule,
      providers: [KafkaService, KafkaConfigHelper, ...kafkaProviders],
      exports: [KafkaService, ...kafkaProviders],
      global: true,
    };
  }
}

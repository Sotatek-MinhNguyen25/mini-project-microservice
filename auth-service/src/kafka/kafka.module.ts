// kafka.module.ts
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { KafkaConfigHelper } from './kafka-config.helper';

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
      providers: [KafkaConfigHelper, ...kafkaProviders],
      exports: kafkaProviders,
      global: true,
    };
  }
}

export interface Configuration {
  app: {
    port: number;
  };
  redis: {
    url: string;
  };
  kafka: {
    brokers: string;
  };
}

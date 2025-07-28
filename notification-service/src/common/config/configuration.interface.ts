export interface Configuration {
  app: {
    port: number;
  };
  redis: {
    url: string;
  };
  kafka: {
    url: string;
  };
}

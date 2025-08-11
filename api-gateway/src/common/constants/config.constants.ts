export const CONFIG_CONSTANTS = {
  // Default values
  DEFAULT_PORT: 8000,
  DEFAULT_HOST: 'localhost',
  DEFAULT_API_PREFIX: 'api/v1',

  // Kafka defaults
  DEFAULT_KAFKA_BROKER: 'localhost:29092',
  DEFAULT_KAFKA_CLIENT_ID: 'api-gateway',
  DEFAULT_KAFKA_GROUP_ID: 'api-gateway-group',

  // Environment variable names
  ENV_VARS: {
    PORT: 'PORT',
    HOST: 'HOST',
    API_PREFIX: 'API_PREFIX',
    KAFKA_BROKER: 'KAFKA_BROKER',
    KAFKA_CLIENT_ID: 'KAFKA_CLIENT_ID',
    KAFKA_GROUP_ID: 'KAFKA_GROUP_ID',
  },
} as const;

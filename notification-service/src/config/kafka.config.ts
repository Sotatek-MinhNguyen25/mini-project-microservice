export default () => ({
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',
    groupId: process.env.KAFKA_GROUP_ID || 'notification-group',
    topic: process.env.KAFKA_TOPIC || 'notification-topic',
  },
});

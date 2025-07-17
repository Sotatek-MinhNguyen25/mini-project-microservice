const configuration = () => ({
    port: parseInt(process.env.PORT || '8000'),
    host: process.env.HOST || 'localhost',
    apiPrefix: process.env.API_PREFIX || 'api/v1',

    kafka: {
        brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
        clientId: process.env.KAFKA_CLIENT_ID || 'api-gateway',
        groupId: process.env.KAFKA_GROUP_ID || 'api-gateway-group',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'my_secret_key',
        accessTokenExpired: process.env.AC_TOKEN_EXPIRED || '3d',
        refreshTokenExpired: process.env.RF_TOKEN_EXPIRED || '7d',
    },
});

export default configuration;
export const config = configuration();

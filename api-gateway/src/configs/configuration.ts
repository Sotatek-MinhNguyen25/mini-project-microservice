import * as dotenv from 'dotenv';
import { CONFIG_CONSTANTS } from '../common/constants/config.constants';

dotenv.config();

const configuration = () => ({
  port: parseInt(process.env[CONFIG_CONSTANTS.ENV_VARS.PORT] || CONFIG_CONSTANTS.DEFAULT_PORT.toString()),
  host: process.env[CONFIG_CONSTANTS.ENV_VARS.HOST] || CONFIG_CONSTANTS.DEFAULT_HOST,
  apiPrefix: process.env[CONFIG_CONSTANTS.ENV_VARS.API_PREFIX] || CONFIG_CONSTANTS.DEFAULT_API_PREFIX,

  kafka: {
    brokers: process.env[CONFIG_CONSTANTS.ENV_VARS.KAFKA_BROKER] || CONFIG_CONSTANTS.DEFAULT_KAFKA_BROKER,
    clientId: process.env[CONFIG_CONSTANTS.ENV_VARS.KAFKA_CLIENT_ID] || CONFIG_CONSTANTS.DEFAULT_KAFKA_CLIENT_ID,
    groupId: process.env[CONFIG_CONSTANTS.ENV_VARS.KAFKA_GROUP_ID] || CONFIG_CONSTANTS.DEFAULT_KAFKA_GROUP_ID,
  },
});

export default configuration;
export const config = configuration();

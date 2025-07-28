export const CONSTANTS = {
  MESSAGE_PATTERN: {
    NOTIFICATION: {
      COMMENT: {
        REPLY: 'comment.reply',
      },
    },
    AUTH: {
      VERIFY_TOKEN: 'auth.verify-token',
    },
  },
  KAFKA_PATTERN: {
    AUTH: 'KAFKA_AUTH_SERVICE',
  },
  WS_MESSAGE_PATTERN: {
    REPLY_COMMENT: 'emitMessage',
  },
} as const;

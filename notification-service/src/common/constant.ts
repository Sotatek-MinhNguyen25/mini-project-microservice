export const CONSTANTS = {
  MESSAGE_PATTERN: {
    NOTIFICATION: {
      COMMENT: 'comment',
    },
    AUTH: {
      VERIFY_TOKEN: 'auth.verify-token',
    },
  },
  KAFKA_PATTERN: {
    AUTH: 'KAFKA_AUTH_SERVICE',
  },
  WS_MESSAGE_PATTERN: {
    COMMENT_REPLY: 'comment.reply',
  },
} as const;

export const CONSTANTS = {
  MESSAGE_PATTERN: {
    NOTIFICATION: {
      COMMENT: 'comment',
      REACTION: 'reaction',
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
    REACTION: 'reaction',
  },
} as const;

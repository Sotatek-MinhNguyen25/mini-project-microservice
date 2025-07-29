export const CONSTANTS = {
  MESSAGE_PATTERN: {
    NOTIFICATION: {
      CREATE: 'noti.create',
      UPDATE_ONE: 'noti.update-one',
      UPDATE_MANY: 'noti.update-many',
      FIND_ALL: 'noti.find-all',
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
  WS_EVENTS: {
    NOTI_TRIGGER: 'event.noti-trigger',
  },
} as const;

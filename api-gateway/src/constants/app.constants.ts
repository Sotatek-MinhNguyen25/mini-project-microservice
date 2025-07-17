// Kafka Client Names
export const KAFKA_CLIENTS = {
  AUTH: 'AUTH_CLIENT',
  POST: 'POST_CLIENT',
  UPLOAD: 'UPLOAD_CLIENT',
  NOTIFICATION: 'NOTIFICATION_CLIENT',
} as const;

// Kafka Event Patterns
export const KAFKA_PATTERNS = {
  // Auth Service Events
  AUTH: {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    REFRESH_TOKEN: 'auth.refresh-token',
    CHECK_USER: 'auth.check-user',
    LOGOUT: 'auth.logout',
  },

  // Post Service Events
  POST: {
    CREATE: 'post.create',
    UPDATE: 'post.update',
    DELETE: 'post.delete',
    GET: 'post.get',
    LIST: 'post.list',
    LIKE: 'post.like',
    UNLIKE: 'post.unlike',
  },

  // Upload Service Events
  UPLOAD: {
    FILE: 'upload.file',
    IMAGE: 'upload.image',
    DELETE: 'upload.delete',
    GET_URL: 'upload.get-url',
  },

  // Notification Service Events
  NOTIFICATION: {
    SEND: 'notification.send',
    LIST: 'notification.list',
    MARK_READ: 'notification.mark-read',
    MARK_ALL_READ: 'notification.mark-all-read',
    DELETE: 'notification.delete',
  },
} as const;

// JWT Related
export const JWT_CONSTANTS = {
  IS_PUBLIC_KEY: 'isPublic',
  STRATEGY_NAME: 'jwt',
} as const;

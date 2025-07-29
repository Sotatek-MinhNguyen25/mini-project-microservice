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
    FORGOT_PASSWORD: 'auth.forgot-password',
    VERIFY_FORGOT_PASSWORD: 'auth.verify-forgot-password',
    UPDATE_PASSWORD: 'auth.update-password',
    COMPLETE_REGISTER: 'auth.complete-register',
    VERIFY_TOKEN: 'auth.verify-token',
  },

  USER: {
    FIND_ONE: 'user.find-one',
    FIND_IDS: 'user.find-ids',
    FIND_MANY: 'user.find-many',
    CREATE: 'user.create',
    DELETE: 'user.delete',
    UPDATE: 'user.update',
    DETAIL_GET: 'user.detail.get',
    DETAIL_UPDATE: 'user.detail.update',
    DETAIL_AVATAR_UPDATE: 'user.detail.avatar-update',
  },

  // Post Service Events
  POST: {
    CREATE: 'post.create',
    UPDATE: 'post.update',
    DELETE: 'post.delete',
    GET: 'post.get',
    GET_DETAIL: 'post.get-detail',
    LIST: 'post.list',
    LIKE: 'post.like',
    UNLIKE: 'post.unlike',
    COMMENT: {
      CREATE: 'comment.create',
      GET_BY_POST: 'comment.get_by_post',
      UPDATE: 'comment.update',
      DELETE: 'comment.delete',
      GET_CHILD: 'comment.get-child',
    },
    TAG: {
      CREATE: 'tag.create',
      GET: 'tag.get',
      UPDATE: 'tag.update',
      DELETE: 'tag.delete',
      GET_BY_POST_ID: 'tag.get_by_post',
      CREATE_POST_TAG: 'posttag.create',
      DELETE_POST_TAG: 'posttag.delete',
    },
    REACTION: {
      GET_BY_POST: 'reaction.get_by_post',
      GET_SUMMARY_BY_POST: 'reaction.get_summary_by_post',
      CREATE: 'reaction.create',
      UPDATE: 'reaction.update',
      DELETE: 'reaction.delete',
    },
  },

  // Upload Service Events
  UPLOAD: {
    FILE: 'upload.file',
    IMAGE: 'upload.image',
    FILES: 'upload.files',
    IMAGES: 'upload.images',
    DELETE: 'upload.delete',
    GET_URL: 'upload.get-url',
  },

  // Notification Service Events
  NOTIFICATION: {
    SEND: 'notification.send',
    LIST: 'noti.find-all',
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

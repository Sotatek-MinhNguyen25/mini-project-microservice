import { NotificationType } from '@/types/notification';

// const/websocketEvents.ts
export const WEBSOCKET_EVENTS = {
  // Socket.IO events (khác với WebSocket events)
  INCOMING: {
    NOTIFICATION_TRIGGER: 'event.noti-trigger',

    // Socket.IO built-in events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
  },
  OUTGOING: {
    MARK_READ: 'mark_read',
    MARK_ALL_READ: 'mark_all_read',
    DELETE: 'delete',
    GET_NOTIFICATIONS: 'get_notifications',
    UPDATE_PREFERENCES: 'update_preferences',
    HEARTBEAT: 'heartbeat',
  },
} as const;

export const WEBSOCKET_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
  HEARTBEAT_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 10000,
} as const;

// Socket.IO specific config
export const SOCKETIO_CONFIG = {
  TRANSPORTS: ['websocket', 'polling'],
  UPGRADE: true,
  REMEMBER_UPGRADE: true,
  FORCE_NEW: false,
  TIMEOUT: 20000,
} as const;

export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 50,
  FETCH_LIMIT: 20,
  AUTO_MARK_READ_DELAY: 3000,
  SOUND_ENABLED: true,
  DESKTOP_ENABLED: true,
  SOUND_VOLUME: 0.7,
  AUTO_CLOSE_DELAY: 5000,
} as const;

export const NOTIFICATION_SOUNDS = {
  default: '/sounds/notification-default.mp3',
  like: '/sounds/notification-like.mp3',
  comment: '/sounds/notification-comment.mp3',
  message: '/sounds/notification-message.mp3',
  friend_request: '/sounds/notification-friend.mp3',
  mention: '/sounds/notification-mention.mp3',
  share: '/sounds/notification-share.mp3',
} as const;

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enableDesktop: true,
  enableInApp: true,
  mutedTypes: [] as NotificationType[],
  autoMarkRead: true,
};

import { NotificationPreferences } from '@/types/notification';

export const WEBSOCKET_EVENTS = {
  INCOMING: {
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification_read',
    NOTIFICATION_DELETED: 'notification_deleted',
    BULK_NOTIFICATIONS: 'bulk_notifications',
    COUNT_UPDATE: 'notification_count_update',
    ERROR: 'error',
    CONNECTION_ESTABLISHED: 'connection_established',
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

export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 50,
  FETCH_LIMIT: 20,
  AUTO_MARK_READ_DELAY: 3000,
  AUTO_CLOSE_DELAY: 5000,
} as const;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableInApp: true,
  mutedTypes: [],
  autoMarkRead: true,
} as const;

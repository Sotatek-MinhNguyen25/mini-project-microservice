import {
  NotificationPreferences,
  NotificationSummary,
  Notification,
} from './notification';

export interface WebSocketMessage {
  id: string;
  timestamp: number;
  type: string;
}

export interface NotificationMessage extends WebSocketMessage {
  type:
    | 'notification'
    | 'notification_read'
    | 'notification_deleted'
    | 'bulk_notifications';
  data: any;
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  error: string;
  code?: number;
}

export type WebSocketIncomingMessage = NotificationMessage | ErrorMessage;

export interface NotificationActionMessage extends WebSocketMessage {
  type:
    | 'mark_read'
    | 'mark_all_read'
    | 'delete'
    | 'get_notifications'
    | 'update_preferences';
  notificationId?: string;
  limit?: number;
  offset?: number;
  preferences?: NotificationPreferences;
}

export type WebSocketOutgoingMessage = NotificationActionMessage;

// ============ HOOK TYPES ============
export interface UseWebSocketConfig {
  url: string;
  protocols?: string | string[];
  options?: {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    shouldReconnect?: boolean;
    enableAutoMarkRead?: boolean;
    maxNotifications?: number;
  };
}

export interface UseWebSocketReturn {
  // Connection
  isConnected: boolean;
  connectionStatus: string;
  reconnect: () => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  summary: NotificationSummary;
  isLoading: boolean;
  preferences: NotificationPreferences;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  loadMore: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

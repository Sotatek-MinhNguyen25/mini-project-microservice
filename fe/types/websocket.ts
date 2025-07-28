// types/websocket.ts
import { Socket } from 'socket.io-client';
import {
  NotificationPreferences,
  NotificationSummary,
  Notification,
} from './notification';

// Thêm Socket.IO types
export interface UseWebSocketConfig {
  url: string;
  options?: {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    shouldReconnect?: boolean;
    enableAutoMarkRead?: boolean;
    maxNotifications?: number;
    // Socket.IO specific options
    auth?: any;
    query?: any;
    transports?: string[];
    forceNew?: boolean;
  };
}

export interface UseWebSocketReturn {
  // Connection
  isConnected: boolean;
  connectionStatus: string;
  reconnect: () => void;
  socket: Socket | null;

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

// Socket.IO Event interfaces
export interface ServerToClientEvents {
  notification: (data: Notification) => void;
  notification_read: (data: { notificationId: string }) => void;
  notification_deleted: (data: { notificationId: string }) => void;
  bulk_notifications: (data: {
    notifications: Notification[];
    summary: NotificationSummary;
  }) => void;
  notification_count_update: (data: Partial<NotificationSummary>) => void;
  error: (data: { message: string; code?: number }) => void;
  connect: () => void;
  disconnect: () => void;
}

export interface ClientToServerEvents {
  mark_read: (data: { notificationId: string }) => void;
  mark_all_read: () => void;
  delete: (data: { notificationId: string }) => void;
  get_notifications: (data: { limit: number; offset: number }) => void;
  update_preferences: (data: { preferences: NotificationPreferences }) => void;
  heartbeat: () => void;
}

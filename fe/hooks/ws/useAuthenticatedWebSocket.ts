import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Notification } from '@/types/notification';
import { useWebSocket } from './useWebSocket';

interface UseAuthenticatedWebSocketConfig {
  baseUrl?: string;
  options?: {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    shouldReconnect?: boolean;
    enableAutoMarkRead?: boolean;
    maxNotifications?: number;
  };
}

export const useAuthenticatedWebSocket = ({
  baseUrl = 'http://localhost:3002',
  options = {},
}: UseAuthenticatedWebSocketConfig = {}): any & {
  isAuthenticated: boolean;
  authUser: any;
  getNotificationMessage: (notification: Notification) => string;
  getNotificationUrl: (notification: Notification) => string;
} => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const { wsUrl, socketOptions } = useMemo(() => {
    if (!isAuthenticated || !token || isLoading) {
      return { wsUrl: null, socketOptions: {} };
    }

    try {
      const socketOptions = {
        ...options,
        auth: {
          accessToken: token,
          userId: user?.id?.toString(),
          userEmail: user?.email,
        },
        query: {
          version: '1.0',
        },
        transports: ['websocket', 'polling'],
      };

      return {
        wsUrl: baseUrl,
        socketOptions,
      };
    } catch (error) {
      console.error('Error creating Socket.IO config:', error);
      return { wsUrl: null, socketOptions: {} };
    }
  }, [
    baseUrl,
    isAuthenticated,
    token,
    user?.id,
    user?.email,
    isLoading,
    options,
  ]);

  // Sử dụng hook WebSocket với Socket.IO config
  const websocketResult = useWebSocket({
    url: wsUrl || '',
    options: socketOptions,
  });

  const { notifications } = websocketResult;

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n: Notification) => !n.isRead).length;
  }, [notifications]);

  const getNotificationUrl = useCallback(
    (notification: Notification): string => {
      return `/post/${notification.postId}`;
    },
    [],
  );

  return {
    ...websocketResult,
    isAuthenticated,
    authUser: user,
    getNotificationUrl,
    getUnreadCount,
  };
};

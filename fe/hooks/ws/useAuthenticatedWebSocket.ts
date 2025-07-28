// hooks/useAuthenticatedWebSocket.ts
import { useMemo, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '@/contexts/auth-context';
import type { UseWebSocketReturn } from '@/types/websocket';
import type { Notification } from '@/types/notification';

interface UseAuthenticatedWebSocketConfig {
  baseUrl?: string;
  options?: {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    shouldReconnect?: boolean;
  };
}

export const useAuthenticatedWebSocket = ({
  baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:15000',
  options = {},
}: UseAuthenticatedWebSocketConfig = {}): UseWebSocketReturn & {
  isAuthenticated: boolean;
  authUser: any;
  getNotificationMessage: (notification: Notification) => string;
} => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const { wsUrl, socketOptions } = useMemo(() => {
    if (!isAuthenticated || !token || isLoading) {
      return { wsUrl: null, socketOptions: {} };
    }

    try {
      // Cho Socket.IO, chúng ta pass auth qua options thay vì URL params
      const socketOptions = {
        ...options,
        auth: {
          token,
          userId: user?.id?.toString(),
          userEmail: user?.email,
        },
        query: {
          version: '1.0',
        },
        transports: ['websocket', 'polling'], // Fallback transports
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

  const getNotificationMessage = useCallback(
    (notification: Notification): string => {
      switch (notification.type) {
        case 'like':
          return `${notification.data.actorName} đã thích bài viết của bạn`;
        case 'comment':
          return `${notification.data.actorName} đã bình luận: "${notification.data.commentText}"`;
        case 'friend_request':
          return `${notification.data.actorName} đã gửi lời mời kết bạn`;
        case 'message':
          return `${notification.data.senderName}: ${notification.data.messagePreview}`;
        case 'mention':
          return `${notification.data.actorName} đã nhắc đến bạn trong một bài viết`;
        default:
          return 'Bạn có thông báo mới';
      }
    },
    [],
  );

  return {
    ...websocketResult,
    isAuthenticated,
    authUser: user,
    getNotificationMessage,
  };
};

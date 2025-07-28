// hooks/useAuthenticatedWebSocket.ts
import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { io } from 'socket.io-client';
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
  baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8086',
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
      // Cho Socket.IO, chúng ta pass auth qua options thay vì URL params
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

  const getNotificationMessage = useCallback((notification: any): string => {
    switch (notification.type) {
      case 'reaction':
        return `${notification.data.actorName} đã thích bài viết của bạn`;
      case 'comment':
        return `${notification.data.actorName} đã bình luận: "${notification.data.commentText}"`;
      case 'friend_request':
        return `${notification.data.actorName} đã gửi lời mời kết bạn`;
      // case 'friend_accept':
      //   return `${notification.data.actorName} đã chấp nhận lời mời kết bạn`;
      case 'message':
        return `${notification.data.senderName}: ${notification.data.messagePreview}`;
      case 'mention':
        return `${notification.data.actorName} đã nhắc đến bạn trong một bài viết`;
      // case 'share':
      //   return `${notification.data.actorName} đã chia sẻ bài viết của bạn`;
      // case 'post_update':
      //   return `Có cập nhật mới từ bài viết bạn quan tâm`;
      // case 'birthday':
      //   return `Hôm nay là sinh nhật của ${notification.data.actorName}`;
      // case 'event_reminder':
      //   return `Nhắc nhở sự kiện: ${notification.data.eventName} sắp diễn ra`;
      default:
        return 'Bạn có thông báo mới';
    }
  }, []);

  const getNotificationUrl = useCallback(
    (notification: Notification): string => {
      switch (notification.type) {
        case 'like':
        case 'comment':
        case 'mention':
        // case 'share':
        //   return `/posts/${notification.data.postId}`;
        case 'friend_request':
        // case 'friend_accept':
        //   return `/profile/${notification.data.actorId}`;
        // case 'message':
        //   return `/messages/${notification.data.conversationId}`;
        // case 'post_update':
        //   return `/posts/${notification.data.postId}`;
        default:
          return '/notifications';
      }
    },
    [],
  );

  return {
    ...websocketResult,
    isAuthenticated,
    authUser: user,
    getNotificationMessage,
    getNotificationUrl,
  };
};

import { useMemo } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '@/contexts/auth-context';
import type { UseWebSocketReturn } from '@/types/websocket';

interface UseAuthenticatedWebSocketConfig {
  baseUrl?: string;
  protocols?: string | string[];
  options?: {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    shouldReconnect?: boolean;
    enableAutoMarkRead?: boolean;
    maxNotifications?: number;
  };
}

export const useAuthenticatedWebSocket = ({
  baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  protocols,
  options = {},
}: UseAuthenticatedWebSocketConfig = {}): UseWebSocketReturn & {
  isAuthenticated: boolean;
  authUser: any;
} => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  // 🔑 Chỉ tạo WebSocket URL khi user đã authenticated
  const wsUrl = useMemo(() => {
    if (!isAuthenticated || !token || isLoading) {
      return null; // Không kết nối nếu chưa login hoặc đang loading
    }

    try {
      const url = new URL(baseUrl);

      // Thêm authentication parameters
      url.searchParams.append('token', token);

      if (user?.id) {
        url.searchParams.append('userId', user.id.toString());
      }

      if (user?.email) {
        url.searchParams.append('userEmail', user.email);
      }

      return url.toString();
    } catch (error) {
      console.error('Error creating WebSocket URL:', error);
      return null;
    }
  }, [baseUrl, isAuthenticated, token, user?.id, user?.email, isLoading]);

  // Sử dụng hook WebSocket với URL conditional
  const websocketResult = useWebSocket({
    url: wsUrl || '',
    protocols,
    options: {
      ...options,
      // Chỉ reconnect nếu vẫn còn authenticated
      shouldReconnect: isAuthenticated && Boolean(wsUrl),
    },
  });

  return {
    ...websocketResult,
    isAuthenticated,
    authUser: user,
  };
};

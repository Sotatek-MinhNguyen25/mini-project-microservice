import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  UseWebSocketConfig,
  UseWebSocketReturn,
} from '@/types/websocket';
import type {
  Notification,
} from '@/types/notification';

export const useWebSocket = ({
  url,
  options = {},
}: UseWebSocketConfig): UseWebSocketReturn => {
  // States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Refs
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!url) return;

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      auth: options.auth,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      setConnectionStatus('Error');
    });

    // Chỉ lắng nghe notification event
    socket.on('notification', (data) => {
      console.log('🔔 Notification từ server:', data);
      handleNewNotification(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    },
    [],
  );

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    connectionStatus,
    reconnect,
    socket: socketRef.current,
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  };
};

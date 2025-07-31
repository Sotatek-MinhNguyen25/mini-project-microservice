import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  UseWebSocketConfig,
  UseWebSocketReturn,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@/types/websocket';
import type {
  Notification,
  NotificationPreferences,
  NotificationSummary,
  NotificationType,
} from '@/types/notification';
import {
  WEBSOCKET_EVENTS,
  WEBSOCKET_CONFIG,
  NOTIFICATION_CONFIG,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/const/websocketEvents';
import notificationService from '@/service/notification.service';
import { useQueryClient } from '@tanstack/react-query';

export const useWebSocket = ({
  url,
  options = {},
}: UseWebSocketConfig): UseWebSocketReturn => {
  // States
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary>({
    total: 0,
    unread: 0,
    byType: {} as Record<NotificationType, number>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Refs
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!url) return;

    // Create socket connection
    const socket = io(url, {
      transports: options.transports || ['websocket', 'polling'],
      auth: options.auth,
      query: options.query,
      forceNew: options.forceNew || false,
      reconnection: options.shouldReconnect !== false,
      reconnectionAttempts:
        options.reconnectAttempts || WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS,
      reconnectionDelay:
        options.reconnectInterval || WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
    });

    socketRef.current = socket;

    // Connection event listeners
    socket.on('connect', () => {
      // console.log('Socket.IO connected with ID:', socket.id);
      setIsConnected(true);
      setConnectionStatus('Connected');
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        socket.auth = {
          accessToken,
        };
      }
      reconnectAttemptsRef.current = 0;
      loadNotifications();
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      setConnectionStatus('Error');

      reconnectAttemptsRef.current++;
      const maxAttempts =
        options.reconnectAttempts || WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS;

      if (reconnectAttemptsRef.current >= maxAttempts) {
        setConnectionStatus('Failed');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      reconnectAttemptsRef.current = 0;
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      setConnectionStatus('Reconnecting');
    });

    // Notification event listeners
    socket.on(
      WEBSOCKET_EVENTS.INCOMING.NOTIFICATION_TRIGGER,
      handleNotificationTrigger,
    );

    socket.on('error', handleError);

    // Cleanup function
    return () => {
      // console.log('Cleaning up Socket.IO connection');
      socket.disconnect();
    };
  }, []);

  // Initialize preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('notification_preferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsedPrefs });
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Event handlers
  const handleNotificationTrigger = useCallback(async () => {
    const response: any = await notificationService.getNotification();
    console.log('New notifications received:', response);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setNotifications(response.data);
    setSummary(response.meta);
  }, []);

  const handleError = useCallback(
    (data: { message: string; code?: number }) => {
      console.error('Socket.IO error received:', data);
    },
    [],
  );

  // Actions
  const loadNotifications = useCallback(() => {
    if (!socketRef.current?.connected) return;

    setIsLoading(true);
    socketRef.current.emit('get_notifications', {
      limit: NOTIFICATION_CONFIG.FETCH_LIMIT,
      offset: 0,
    });
  }, []);

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      const newPreferences = { ...preferences, ...prefs };
      setPreferences(newPreferences);

      if (socketRef.current?.connected) {
        socketRef.current.emit('update_preferences', {
          preferences: newPreferences,
        });
      }

      localStorage.setItem(
        'notification_preferences',
        JSON.stringify(newPreferences),
      );
    },
    [preferences],
  );

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
    reconnectAttemptsRef.current = 0;
  }, []);

  return {
    // Connection
    isConnected,
    connectionStatus,
    reconnect,
    socket: socketRef.current,

    // Notifications
    notifications,
    unreadCount: summary.unread,
    summary,
    isLoading,
    preferences,

    // Actions
    updatePreferences,
  };
};

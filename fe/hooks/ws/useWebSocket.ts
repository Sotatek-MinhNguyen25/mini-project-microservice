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

export const useWebSocket = ({
  url,
  options = {},
}: UseWebSocketConfig): UseWebSocketReturn => {
  // States
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
  const autoReadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!url) return;

    console.log('Initializing Socket.IO connection to:', url);

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
      console.log('Socket.IO connected with ID:', socket.id);
      setIsConnected(true);
      setConnectionStatus('Connected');
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        socket.auth = {
          accessToken,
        };
      }
      reconnectAttemptsRef.current = 0;
      startHeartbeat();
      loadNotifications();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      stopHeartbeat();
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
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionStatus('Connected');
      reconnectAttemptsRef.current = 0;
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnection attempt:', attemptNumber);
      setConnectionStatus('Reconnecting');
    });

    // Notification event listeners
    socket.on('comment.reply', handleNewNotification);
    socket.on('bulk_notifications', handleBulkNotifications);
    socket.on('notification_read', handleNotificationRead);
    socket.on('notification_deleted', handleNotificationDeleted);
    socket.on('notification_count_update', handleCountUpdate);
    socket.on('error', handleError);

    // Cleanup function
    return () => {
      console.log('Cleaning up Socket.IO connection');
      stopHeartbeat();
      autoReadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
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
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      console.log('New notification received:', notification);

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notification.id);
        const maxNotifications =
          options.maxNotifications ?? NOTIFICATION_CONFIG.MAX_NOTIFICATIONS;
        return [notification, ...filtered].slice(0, maxNotifications);
      });

      setSummary((prev) => ({
        total: prev.total + 1,
        unread: prev.unread + (notification.isRead ? 0 : 1),
        byType: {
          ...prev.byType,
          [notification.type]: (prev.byType[notification.type] || 0) + 1,
        },
      }));

      // Auto mark as read
      const enableAutoMarkRead = options.enableAutoMarkRead ?? true;
      if (enableAutoMarkRead && !notification.isRead) {
        const timeout = setTimeout(() => {
          markAsRead(notification.id);
        }, NOTIFICATION_CONFIG.AUTO_MARK_READ_DELAY);

        autoReadTimeouts.current.set(notification.id, timeout);
      }
    },
    [options.maxNotifications, options.enableAutoMarkRead],
  );

  const handleBulkNotifications = useCallback(
    (data: { notifications: Notification[]; summary: NotificationSummary }) => {
      setNotifications(data.notifications);
      setSummary(data.summary);
      setIsLoading(false);
    },
    [],
  );

  const handleNotificationRead = useCallback(
    (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setSummary((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    },
    [],
  );

  const handleNotificationDeleted = useCallback(
    (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== data.notificationId),
      );
    },
    [],
  );

  const handleCountUpdate = useCallback(
    (data: Partial<NotificationSummary>) => {
      setSummary((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const handleError = useCallback(
    (data: { message: string; code?: number }) => {
      console.error('Socket.IO error received:', data);
    },
    [],
  );

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('heartbeat');
      }
    }, WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Actions
  const loadNotifications = useCallback(() => {
    if (!socketRef.current?.connected) return;

    setIsLoading(true);
    socketRef.current.emit('get_notifications', {
      limit: NOTIFICATION_CONFIG.FETCH_LIMIT,
      offset: 0,
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    // Clear timeout
    const timeout = autoReadTimeouts.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      autoReadTimeouts.current.delete(notificationId);
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    // Send to server
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_read', { notificationId });
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    // Clear all timeouts
    autoReadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    autoReadTimeouts.current.clear();

    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSummary((prev) => ({ ...prev, unread: 0 }));

    // Send to server
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_all_read');
    }
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    if (socketRef.current?.connected) {
      socketRef.current.emit('delete', { notificationId });
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!socketRef.current?.connected || isLoading) return;

    setIsLoading(true);
    socketRef.current.emit('get_notifications', {
      limit: NOTIFICATION_CONFIG.FETCH_LIMIT,
      offset: notifications.length,
    });
  }, [isLoading, notifications.length]);

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
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    updatePreferences,
  };
};

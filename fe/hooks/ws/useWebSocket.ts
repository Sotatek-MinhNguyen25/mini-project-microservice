import { useState, useEffect, useRef, useCallback } from 'react';
import useReactWebSocket, { ReadyState } from 'react-use-websocket';
import type {
  UseWebSocketConfig,
  UseWebSocketReturn,
  WebSocketIncomingMessage,
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
import { generateMessageId } from '@/app/helper/webSocket.helper';

export const useWebSocket = ({
  url,
  protocols,
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

  const autoReadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } =
    useReactWebSocket(url, {
      protocols,
      shouldReconnect: () => {
        const shouldReconnect = options.shouldReconnect ?? true;
        const maxAttempts =
          options.reconnectAttempts ?? WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS;

        if (!shouldReconnect) return false;

        if (reconnectAttemptsRef.current < maxAttempts) {
          reconnectAttemptsRef.current++;
          return true;
        }
        return false;
      },
      reconnectInterval:
        options.reconnectInterval ?? WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
      onOpen: () => {
        console.log('WebSocket connection established');
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
        loadNotifications();
      },
      onClose: () => {
        console.log('WebSocket connection closed');
        stopHeartbeat();
      },
      onError: (event: Event) => {
        console.error('WebSocket error:', event);
      },
    });

  // Initialize
  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('notification_preferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsedPrefs });
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }

    return () => {
      stopHeartbeat();
      autoReadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastJsonMessage) return;

    const message = lastJsonMessage as WebSocketIncomingMessage;

    switch (message.type) {
      case WEBSOCKET_EVENTS.INCOMING.NOTIFICATION:
        handleNewNotification(message.data as Notification);
        break;

      case WEBSOCKET_EVENTS.INCOMING.BULK_NOTIFICATIONS:
        setNotifications(message.data.notifications);
        setSummary(message.data.summary);
        setIsLoading(false);
        break;

      case WEBSOCKET_EVENTS.INCOMING.NOTIFICATION_READ:
        handleNotificationRead(message.data.notificationId);
        break;

      case WEBSOCKET_EVENTS.INCOMING.NOTIFICATION_DELETED:
        handleNotificationDeleted(message.data.notificationId);
        break;

      case WEBSOCKET_EVENTS.INCOMING.ERROR:
        console.error('WebSocket error:', message);
        break;
    }
  }, [lastJsonMessage]);

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage({
          type: WEBSOCKET_EVENTS.OUTGOING.HEARTBEAT,
          id: generateMessageId('heartbeat'),
          timestamp: Date.now(),
        });
      }
    }, WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL);
  }, [readyState, sendJsonMessage]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Notification handlers
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      // Update notifications list
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notification.id);
        const maxNotifications =
          options.maxNotifications ?? NOTIFICATION_CONFIG.MAX_NOTIFICATIONS;
        return [notification, ...filtered].slice(0, maxNotifications);
      });

      // Update summary
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
    [preferences, options],
  );

  const handleNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setSummary((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  }, []);

  const handleNotificationDeleted = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Actions
  const loadNotifications = useCallback(() => {
    if (readyState !== ReadyState.OPEN) return;

    setIsLoading(true);
    sendJsonMessage({
      type: WEBSOCKET_EVENTS.OUTGOING.GET_NOTIFICATIONS,
      id: generateMessageId('load'),
      timestamp: Date.now(),
      limit: NOTIFICATION_CONFIG.FETCH_LIMIT,
      offset: 0,
    });
  }, [readyState, sendJsonMessage]);

  const markAsRead = useCallback(
    (notificationId: string) => {
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
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage({
          type: WEBSOCKET_EVENTS.OUTGOING.MARK_READ,
          id: generateMessageId('mark'),
          timestamp: Date.now(),
          notificationId,
        });
      }
    },
    [readyState, sendJsonMessage],
  );

  const markAllAsRead = useCallback(() => {
    // Clear all timeouts
    autoReadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    autoReadTimeouts.current.clear();

    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSummary((prev) => ({ ...prev, unread: 0 }));

    // Send to server
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: WEBSOCKET_EVENTS.OUTGOING.MARK_ALL_READ,
        id: generateMessageId('mark_all'),
        timestamp: Date.now(),
      });
    }
  }, [readyState, sendJsonMessage]);

  const deleteNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (readyState === ReadyState.OPEN) {
        sendJsonMessage({
          type: WEBSOCKET_EVENTS.OUTGOING.DELETE,
          id: generateMessageId('delete'),
          timestamp: Date.now(),
          notificationId,
        });
      }
    },
    [readyState, sendJsonMessage],
  );

  const loadMore = useCallback(() => {
    if (readyState !== ReadyState.OPEN || isLoading) return;

    setIsLoading(true);
    sendJsonMessage({
      type: WEBSOCKET_EVENTS.OUTGOING.GET_NOTIFICATIONS,
      id: generateMessageId('load_more'),
      timestamp: Date.now(),
      limit: NOTIFICATION_CONFIG.FETCH_LIMIT,
      offset: notifications.length,
    });
  }, [readyState, isLoading, notifications.length, sendJsonMessage]);

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      const newPreferences = { ...preferences, ...prefs };
      setPreferences(newPreferences);

      if (readyState === ReadyState.OPEN) {
        sendJsonMessage({
          type: WEBSOCKET_EVENTS.OUTGOING.UPDATE_PREFERENCES,
          id: generateMessageId('update_prefs'),
          timestamp: Date.now(),
          preferences: newPreferences,
        });
      }

      localStorage.setItem(
        'notification_preferences',
        JSON.stringify(newPreferences),
      );
    },
    [preferences, readyState, sendJsonMessage],
  );

  const reconnect = useCallback(() => {
    const ws = getWebSocket();
    if (ws) {
      ws.close();
    }
    reconnectAttemptsRef.current = 0;
  }, [getWebSocket]);

  const getConnectionStatus = (): string => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return 'Connecting';
      case ReadyState.OPEN:
        return 'Open';
      case ReadyState.CLOSING:
        return 'Closing';
      case ReadyState.CLOSED:
        return 'Closed';
      default:
        return 'Uninstantiated';
    }
  };

  return {
    // Connection
    isConnected: readyState === ReadyState.OPEN,
    connectionStatus: getConnectionStatus(),
    reconnect,

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

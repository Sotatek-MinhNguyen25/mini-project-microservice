// components/NotificationBell.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthenticatedWebSocket } from '@/hooks/ws/useAuthenticatedWebSocket';
import { Button } from '@/components/ui/button';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { Notification } from '@/types/notification';
import notificationService from '@/service/notification.service';
import { WEBSOCKET_EVENTS } from '@/const/websocketEvents';

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    connectionStatus,
    getUnreadCount,
    getNotificationUrl,
    socket,
  } = useAuthenticatedWebSocket({
    options: {
      shouldReconnect: true,
      reconnectAttempts: 5,
      enableAutoMarkRead: false,
      maxNotifications: 50,
    },
  });

  // Hàm fetch notifications từ API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await notificationService.getNotification();
      console.log('Fetched notifications:', response);

      if (response?.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Fetch notifications ngay khi component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen cho notification trigger từ websocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotificationTrigger = () => {
      console.log('WebSocket notification trigger received, re-fetching...');
      fetchNotifications(); // Re-fetch khi có trigger từ WS
    };

    // Listen event từ websocket
    socket.on(
      WEBSOCKET_EVENTS.INCOMING.NOTIFICATION_TRIGGER,
      handleNotificationTrigger,
    );

    return () => {
      socket.off(
        WEBSOCKET_EVENTS.INCOMING.NOTIFICATION_TRIGGER,
        handleNotificationTrigger,
      );
    };
  }, [socket, isConnected, fetchNotifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTimeAgo = useCallback((timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Reaction':
        return '👍';
      case 'Comment':
        return '💬';
      default:
        return '🔔';
    }
  };

  // Tính số unread từ notifications local thay vì từ hook
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative hover:bg-primary/10 transition-colors"
      >
        <BellOutlined className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[60] max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông báo
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('Marking all as read');
                  }}
                  className="text-xs hover:bg-primary/10"
                >
                  <CheckOutlined className="h-3 w-3 mr-1" />
                  Đánh dấu tất cả
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={fetchNotifications}
                disabled={isLoadingNotifications}
              >
                <SettingOutlined
                  className={`h-3 w-3 ${
                    isLoadingNotifications ? 'animate-spin' : ''
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Connection Status in Dropdown */}
          {!isConnected && (
            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-700 dark:text-yellow-400">
                  {connectionStatus} - Đang thử kết nối lại...
                </span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoadingNotifications && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700 dark:text-blue-400">
                  Đang tải thông báo...
                </span>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <BellOutlined className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`relative flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => {
                    const url = getNotificationUrl(notification);
                    if (url) window.location.href = url;
                    setShowNotifications(false);
                  }}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  {/* Notification Icon */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white mb-1">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-100 dark:hover:bg-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete notification:', notification.id);
                      }}
                    >
                      <DeleteOutlined className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button
                variant="ghost"
                className="w-full text-sm hover:bg-primary/10"
                onClick={() => {
                  setShowNotifications(false);
                  window.location.href = '/notifications';
                }}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

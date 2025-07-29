'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { useAuthenticatedWebSocket } from '@/hooks/ws/useAuthenticatedWebSocket';
import { useNotification } from '@/hooks/usePosts';
import { WEBSOCKET_EVENTS } from '@/const/websocketEvents';
import type { Notification } from '@/types/notification';
import { NotificationButton } from './notification/NotificationButton';
import { NotificationDropdown } from './notification/NotificationDropdown';

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(
    null,
  ) as RefObject<HTMLDivElement>;

  const {
    notifications,
    fetchNotifications,
    loadMoreNotifications,
    setNotifications,
    markOneAsRead,
    markAllAsRead,
    isLoadingNotifications,
    isLoadingMore,
    toast,
    queryClient,
    page,
    totalPages,
    hasMorePages,
  } = useNotification();

  console.log('NotificationBell notifications:', hasMorePages);

  const { isConnected, connectionStatus, getNotificationUrl, socket } =
    useAuthenticatedWebSocket({
      options: {
        shouldReconnect: true,
        reconnectAttempts: 5,
        enableAutoMarkRead: false,
        maxNotifications: 50,
      },
    });

  useClickOutside(notificationRef, () => setShowNotifications(false));

  // Fetch notifications khi component mount
  useEffect(() => {
    fetchNotifications(true); // Reset page = true
  }, []);

  // WebSocket event handler
  const handleNotificationTrigger = useCallback(
    (notification: Notification) => {
      // Thêm notification mới vào đầu list
      setNotifications((prev) => [notification, ...prev]);
      toast({
        title: 'New Notification',
        description: notification.content,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [setNotifications, toast, queryClient],
  );

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

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
  }, [socket, handleNotificationTrigger]);

  const unreadCount = notifications.filter(
    (n: Notification) => !n.isRead,
  ).length;

  // Event handlers
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      const url = getNotificationUrl(notification);
      if (url) {
        window.location.href = url;
      }
      setShowNotifications(false);
    },
    [getNotificationUrl],
  );

  const handleMarkOneAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markOneAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n,
          ),
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to mark notification as read',
        });
      }
    },
    [markOneAsRead, setNotifications, toast],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all notifications as read',
      });
    }
  }, [markAllAsRead, setNotifications, toast]);

  const handleRefresh = useCallback(() => {
    fetchNotifications(true); // Reset và fetch lại từ page 1
  }, [fetchNotifications]);

  const handleShowMoreNotifications = useCallback(() => {
    if (hasMorePages && !isLoadingMore) {
      loadMoreNotifications();
    }
  }, [hasMorePages, isLoadingMore, loadMoreNotifications]);

  return (
    <div className="relative" ref={notificationRef}>
      <NotificationButton
        unreadCount={unreadCount}
        onClick={() => setShowNotifications(!showNotifications)}
      />

      {showNotifications && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoadingNotifications}
          isLoadingMore={isLoadingMore}
          isConnected={isConnected}
          connectionStatus={connectionStatus}
          hasMorePages={hasMorePages}
          currentPage={page}
          totalPages={totalPages}
          onNotificationClick={handleNotificationClick}
          onMarkOneAsRead={handleMarkOneAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={handleRefresh}
          onShowMore={handleShowMoreNotifications}
        />
      )}
    </div>
  );
}

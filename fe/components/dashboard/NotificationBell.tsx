'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { useAuthenticatedWebSocket } from '@/hooks/ws/useAuthenticatedWebSocket';
import { useNotification } from '@/hooks/usePosts';
import type { Notification } from '@/types/notification';
import { NotificationButton } from './notification/NotificationButton';
import { NotificationDropdown } from './notification/NotificationDropdown';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const {
    notifications,
    unreadCount,
    markOneAsRead,
    markAllAsRead,
    isLoadingNotifications,
    isLoadingMore,
    toast,
    page,
    setPage,
    totalPages,
    hasMorePages,
  } = useNotification();
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

  // Event handlers
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      const url = getNotificationUrl(notification);
      if (url) {
        window.location.href = url;
      }
      setShowNotifications(false);
      markOneAsRead(notification.id);
    },
    [getNotificationUrl],
  );

  const handleMarkOneAsRead = async (notificationId: string) => {
    try {
      await markOneAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
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
  };

  const handleRefresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['notifications'],
    });

  const handleShowMoreNotifications = () => {
    if (hasMorePages && !isLoadingMore) {
      queryClient.invalidateQueries({
        queryKey: ['notifications', setPage(page + 1)],
      });
    }
  };

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

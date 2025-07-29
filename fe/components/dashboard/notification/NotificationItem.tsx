'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckOutlined } from '@ant-design/icons';
import type { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
}

export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
}: NotificationItemProps) {
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
      case 'friend_request':
        return '👤';
      case 'message':
        return '📩';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead();
  };

  return (
    <div
      className={`relative flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={onClick}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
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
      {!notification.isRead && (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-800"
            onClick={handleMarkAsRead}
            title="Đánh dấu đã đọc"
          >
            <CheckOutlined className="h-3 w-3 text-blue-600" />
          </Button>
        </div>
      )}
    </div>
  );
}

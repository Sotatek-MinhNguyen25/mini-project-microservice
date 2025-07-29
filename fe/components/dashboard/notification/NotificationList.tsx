'use client';

import { BellOutlined } from '@ant-design/icons';
import type { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="max-h-80 overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <BellOutlined className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">Không có thông báo nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => onNotificationClick(notification)}
          onMarkAsRead={() => onMarkAsRead(notification.id)}
        />
      ))}
    </div>
  );
}

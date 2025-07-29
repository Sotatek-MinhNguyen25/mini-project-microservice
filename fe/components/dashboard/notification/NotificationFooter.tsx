'use client';

import { Button } from '@/components/ui/button';

interface NotificationFooterProps {
  hasNotifications: boolean;
  onMarkAllAsRead: () => void;
}

export function NotificationFooter({
  hasNotifications,
  onMarkAllAsRead,
}: NotificationFooterProps) {
  if (!hasNotifications) {
    return null;
  }

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          className="flex-1 text-sm hover:bg-primary/10"
          onClick={() => {
            window.location.href = '/notifications';
          }}
        >
          Xem tất cả thông báo
        </Button>
        <Button
          variant="ghost"
          className="flex-1 text-sm hover:bg-blue-100 dark:hover:bg-blue-800"
          onClick={onMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
}

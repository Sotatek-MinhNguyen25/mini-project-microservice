'use client';

import { Button } from '@/components/ui/button';
import { CheckOutlined, SettingOutlined } from '@ant-design/icons';

interface NotificationHeaderProps {
  unreadCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

export function NotificationHeader({
  unreadCount,
  isLoading,
  onMarkAllAsRead,
  onRefresh,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Thông báo
      </h3>
      <div className="flex items-center space-x-2">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
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
          onClick={onRefresh}
          disabled={isLoading}
        >
          <SettingOutlined
            className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>
    </div>
  );
}

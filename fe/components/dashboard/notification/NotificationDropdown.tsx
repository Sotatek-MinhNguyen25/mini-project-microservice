'use client';

import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/notification';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isConnected: boolean;
  connectionStatus: string;
  hasMorePages: boolean;
  currentPage: number;
  totalPages: number;
  onNotificationClick: (notification: Notification) => void;
  onMarkOneAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
  onShowMore: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  isLoading,
  isLoadingMore,
  hasMorePages,
  currentPage,
  totalPages,
  onNotificationClick,
  onMarkOneAsRead,
  onMarkAllAsRead,
  onRefresh,
  onShowMore,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[60] max-h-96 overflow-hidden">
      <NotificationHeader
        unreadCount={unreadCount}
        isLoading={isLoading}
        onMarkAllAsRead={onMarkAllAsRead}
        onRefresh={onRefresh}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-700 dark:text-blue-400">
              Đang tải thông báo...
            </span>
          </div>
        </div>
      )}

      <NotificationList
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkOneAsRead}
      />

      {/* Show More Button */}
      {hasMorePages && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full text-sm hover:bg-primary/10"
            onClick={onShowMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                Loading more...
              </>
            ) : (
              `Show more (${currentPage}/${totalPages})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

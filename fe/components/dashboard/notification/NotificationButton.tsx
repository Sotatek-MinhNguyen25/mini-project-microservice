'use client';

import { Button } from '@/components/ui/button';
import { BellOutlined } from '@ant-design/icons';

interface NotificationButtonProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationButton({
  unreadCount,
  onClick,
}: NotificationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
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
  );
}

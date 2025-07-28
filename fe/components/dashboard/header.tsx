'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAuthenticatedWebSocket } from '@/hooks/ws/useAuthenticatedWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { DEFAULT_USER } from '@/const/user';
import type { Notification } from '@/types/notification';

export function Header() {
  const { logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const user = DEFAULT_USER;

  // WebSocket hook để nhận notifications
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    getNotificationMessage,
  } = useAuthenticatedWebSocket({
    options: {
      shouldReconnect: true,
      reconnectAttempts: 5,
    },
  });

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Clicked notification:', notification);
    setShowNotifications(false);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '👍';
      case 'comment':
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

  const fullName = `${user.username} ${user.username}`;
  const initials = `${user.username[0]}${user.username[1]}`;

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Social Blog
              </h1>
              <p className="text-xs text-muted-foreground">Connect & Share</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, users, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/40 focus:border-primary/50 focus:ring-primary/20"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Connection Status - Only show when disconnected */}
            {isAuthenticated && !isConnected && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  Đang kết nối...
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative overflow-hidden group hover:bg-primary/10 transition-colors"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notification Bell */}
            {isAuthenticated && (
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
                            onClick={() => console.log('Mark all as read')}
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
                        >
                          <SettingOutlined className="h-3 w-3" />
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
                            className={`relative flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${!notification.isRead
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : ''
                              }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
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
                                {getNotificationMessage(notification)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Mark as read:', notification.id);
                                  }}
                                >
                                  <CheckOutlined className="h-3 w-3 text-blue-600" />
                                </Button>
                              )}
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
                            // Navigate to full notifications page
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
            )}

            {/* User Avatar Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 glass-effect"
                align="end"
                forceMount
              >
                <div className="flex items-center justify-start gap-2 p-3 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-md mx-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{fullName}</p>
                    <p className="w-[180px] truncate text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

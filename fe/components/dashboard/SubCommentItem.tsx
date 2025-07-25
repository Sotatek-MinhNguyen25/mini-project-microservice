'use client';

import type React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from 'next-themes';
import type { SubComment } from '@/types/post';

interface SubCommentItemProps {
  subComment: SubComment;
}

export function SubCommentItem({ subComment }: SubCommentItemProps) {
  const { theme } = useTheme();
  const subCommentInitials = `${subComment.user.username}`;

  return (
    <div className="flex space-x-2">
      <Avatar className="h-6 w-6 mt-1">
        <AvatarFallback className="text-xs">
          {subCommentInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div
          className={`${
            theme === 'light'
              ? 'bg-gray-100 border border-gray-200'
              : 'bg-gray-700 border border-gray-600'
          } rounded-lg p-2`}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-xs">
              {subComment.user.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(subComment.createdAt)} ago
            </span>
          </div>
          <p className="text-xs leading-relaxed">{subComment.content}</p>
        </div>
      </div>
    </div>
  );
}

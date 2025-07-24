'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { DEFAULT_USER } from '@/const/user';
import { useComment } from '@/hooks/usePosts';
import type { CommentSectionProps } from '@/types/post';
import { useTheme } from 'next-themes';

export function CommentSection({ comments, postId }: CommentSectionProps) {
  const { newComment, setNewComment, commentMutation, handleSubmitComment } =
    useComment(postId);

  const { theme } = useTheme();
  const userInitials =
    DEFAULT_USER.username[0].toUpperCase() +
    DEFAULT_USER.username[1].toUpperCase();

  return (
    <div className="w-full space-y-4">
      {/* Add new comment */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending && (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            )}
            Comment
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const commentInitials = `${comment.user.username[0]}${comment.user.username[1]}`;

          return (
            <div key={comment.id} className="space-y-2">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{commentInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div
                    className={`${
                      theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
                    } rounded-lg p-3`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt)} ago
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

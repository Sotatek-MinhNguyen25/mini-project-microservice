'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from 'next-themes';
import { Loader2, Reply } from 'lucide-react';
import { SubComments } from './SubComments';
import { useReplyComment } from '@/hooks/usePosts';
import { DEFAULT_USER } from '@/const/user';
import type { Comment } from '@/types/post';

interface CommentItemProps {
  comment: Comment;
}

function getInitials(username?: string): string {
  if (!username) return 'NA';
  const trimmed = username.trim();
  return trimmed.slice(0, 2).toUpperCase().padEnd(2, 'A');
}

export function CommentItem({ comment }: CommentItemProps) {
  const { theme } = useTheme();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showSubComments, setShowSubComments] = useState(comment.childComment > 0);
  const [localChildCount, setLocalChildCount] = useState(comment.childComment);

  const username = comment.user?.username || 'Unknown User';
  const commentInitials = getInitials(username);



  const { replyMutation, handleSubmitReply } = useReplyComment(comment.id, replyContent);

  useEffect(() => {
    if (showReplyForm && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showReplyForm]);

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
    if (!showReplyForm) {
      setReplyContent('');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await handleSubmitReply(replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      setShowSubComments(true);
      setLocalChildCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleCancel = () => {
    setShowReplyForm(false);
    setReplyContent('');
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{commentInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div
            className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
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

          {/* Reply button */}
          <div className="mt-2 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-11 mt-3">
          <form onSubmit={handleReplySubmit} className="space-y-2">
            <div className="flex space-x-2">
              <Avatar className="h-6 w-6 mt-1">
                <AvatarFallback className="text-xs">{commentInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder={`Reply to ${username}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 ml-8">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-auto px-3 py-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="h-auto px-3 py-1 text-xs"
              >
                {replyMutation.isPending && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Reply
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-comments section - ✅ Sửa: Chỉ hiển thị khi có sub-comments */}
      {showSubComments && localChildCount > 0 && (
        <SubComments
          parentCommentId={comment.id}
          totalCount={localChildCount}
        />
      )}
    </div>
  );
}

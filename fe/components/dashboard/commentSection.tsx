'use client';

import type React from 'react';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/useToast';
import type { CommentSectionProps } from '@/types/post';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply, Loader2 } from 'lucide-react';
import { DEFAULT_USER } from '@/const/user';

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: Date.now().toString(), content, parentId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: 'Success',
        description: 'Comment added!',
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    commentMutation.mutate({ content: replyContent, parentId });
  };

  const userInitials =
    DEFAULT_USER.username[0].toUpperCase() +
    DEFAULT_USER.username[1].toUpperCase();

  return (
    <div className="w-full space-y-4">
      {/* Add new comment */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={user.profile.avatarUrl || '/placeholder.svg'} alt={userFullName} /> */}
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
          const commentFullName = `${comment.author.profile.firstName} ${comment.author.profile.lastName}`;
          const commentInitials = `${comment.author.profile.firstName[0]}${comment.author.profile.lastName[0]}`;

          return (
            <div key={comment.id} className="space-y-2">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.author.profile.avatarUrl || '/placeholder.svg'}
                    alt={commentFullName}
                  />
                  <AvatarFallback>{commentInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {commentFullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt)} ago
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Heart className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id,
                        )
                      }
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="ml-11">
                  <form
                    onSubmit={(e) => handleSubmitReply(e, comment.id)}
                    className="space-y-2"
                  >
                    <Textarea
                      placeholder={`Reply to ${commentFullName}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          !replyContent.trim() || commentMutation.isPending
                        }
                      >
                        {commentMutation.isPending && (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-2">
                  {comment.replies.map((reply) => {
                    const replyFullName = `${reply.author.profile.firstName} ${reply.author.profile.lastName}`;
                    const replyInitials = `${reply.author.profile.firstName[0]}${reply.author.profile.lastName[0]}`;

                    return (
                      <div key={reply.id} className="flex space-x-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={
                              reply.author.profile.avatarUrl ||
                              '/placeholder.svg'
                            }
                            alt={replyFullName}
                          />
                          <AvatarFallback className="text-xs">
                            {replyInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-xs">
                                {replyFullName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(reply.createdAt)} ago
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

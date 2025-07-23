import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { CommentSection } from '../commentSection';
import { useNewReaction } from '@/hooks/usePosts';
import { Post, ReactionType } from '@/types/post';
import { DEFAULT_USER } from '@/const/user';

export function PostFooter({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = DEFAULT_USER;
  const reactionMutation = useNewReaction();

  const handleReaction = (type: ReactionType) => {
    if (!user) return;
    reactionMutation.mutate({ postId: post.id, type });
    setShowReactions(false);
  };

  const handleReactionHover = () => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
    }
    setShowReactions(true);
  };

  const handleReactionLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 300);
  };

  const reactionEmojis: Record<ReactionType, string> = {
    [ReactionType.LIKE]: '👍',
    [ReactionType.LOVE]: '❤️',
    [ReactionType.HAHA]: '😂',
    [ReactionType.WOW]: '😮',
    [ReactionType.SAD]: '😢',
    [ReactionType.ANGRY]: '😣',
  };

  const userReaction = post.reaction.summary.find((r) => {
    return r.type === ReactionType.LIKE
  });

  return (
    <div className="flex flex-col space-y-4 px-6 pb-6 py-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-1 relative">
          <div
            onClick={() => handleReaction(ReactionType.LIKE)}
            onMouseEnter={handleReactionHover}
            onMouseLeave={handleReactionLeave}
            className="relative"
          >
            {/* <Button
              variant={userReaction ? 'default' : 'ghost'}
              size="sm"
              disabled={reactionMutation.isPending}
              className={`transition-all duration-200 ${
                userReaction
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart
                className={`h-4 w-4 mr-2 transition-all ${userReaction ? 'fill-current scale-110' : ''}`}
              />
              {post.reaction.count}
            </Button> */}

            {showReactions && (
              <div
                className="absolute -top-12 left-0 bg-white dark:bg-gray-800 rounded-full shadow-lg flex space-x-2 p-2"
                onMouseEnter={handleReactionHover}
                onMouseLeave={handleReactionLeave}
              >
                {Object.entries(reactionEmojis).map(([type, emoji]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(ReactionType[type as keyof typeof ReactionType])}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-all"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.totalComment}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20 transition-all"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {showComments && (
        <div className="w-full pt-4 border-t border-border/40">
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      )}
    </div>
  );
}
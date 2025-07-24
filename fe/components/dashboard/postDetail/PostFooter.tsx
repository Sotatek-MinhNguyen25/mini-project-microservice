import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { CommentSection } from '../commentSection';
import { useNewReaction } from '@/hooks/usePosts';
import { Post, Reaction, ReactionType } from '@/types/post';
import { useAuth } from '@/contexts/auth-context';
import { reactionEmojis } from '@/const/reaction';

export function PostFooter({ post }: { post: Post }) {
  const { user } = useAuth();
  const reactionMutation = useNewReaction();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State cục bộ để hiển thị ngay
  const userOwnReaction = post.reactions.find((r) => r.userId === user?.id);
  const [localReaction, setLocalReaction] = useState<ReactionType | null>(
    userOwnReaction?.type ? (userOwnReaction.type as ReactionType) : null,
  );
  const [localCount, setLocalCount] = useState<number>(post.reaction.count);

  useEffect(() => {
    const r = post.reactions.find((r) => r.userId === user?.id);
    setLocalReaction(r?.type ? (r.type as ReactionType) : null);
    setLocalCount(post.reaction.count);
  }, [post, user]);

  const handleReaction = (type: ReactionType) => {
    if (!user) return;

    const isSame = localReaction === type;
    let newCount = localCount;
    let newReaction: ReactionType | null;

    if (isSame) {
      newCount = localCount - 1;
      newReaction = null;
    } else if (!localReaction) {
      newCount = localCount + 1;
      newReaction = type;
    } else {
      newCount = localCount;
      newReaction = type;
    }

    setLocalCount(newCount);
    setLocalReaction(newReaction);

    setShowReactions(false);

    if (newReaction) {
      reactionMutation.mutate({ postId: post.id, type: newReaction });
    }
  };

  const handleReactionHover = () => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    setShowReactions(true);
  };
  const handleReactionLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => setShowReactions(false), 300);
  };

  return (
    <div className="flex flex-col space-y-4 px-6 pb-6 py-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-1 relative">
          <div
            onMouseEnter={handleReactionHover}
            onMouseLeave={handleReactionLeave}
            className="relative"
          >
            <Button
              onClick={() => handleReaction(ReactionType.LIKE)}
              variant={localReaction ? 'default' : 'ghost'}
              size="sm"
              disabled={reactionMutation.isPending}
              className={`transition-all duration-200 ${
                localReaction
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
              }`}
            >
              <span className="mr-2 text-lg">
                {localReaction ? (
                  reactionEmojis[localReaction]
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </span>
              {localCount}
            </Button>

            {showReactions && (
              <div
                className="absolute -top-12 left-0 bg-white dark:bg-gray-800 rounded-full shadow-lg flex space-x-2 p-2"
                onMouseEnter={handleReactionHover}
                onMouseLeave={handleReactionLeave}
              >
                {Object.entries(reactionEmojis).map(([key, emoji]) => {
                  const type = key as keyof typeof ReactionType;
                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(ReactionType[type])}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </Button>
                  );
                })}
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

      {showComments && user && (
        <div className="w-full pt-4 border-t border-border/40">
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      )}
    </div>
  );
}

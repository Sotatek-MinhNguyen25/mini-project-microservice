import { ReactionType } from '@/types/post';

export const reactionEmojis: Record<ReactionType, string> = {
  [ReactionType.LIKE]: '👍',
  [ReactionType.LOVE]: '❤️',
  [ReactionType.HAHA]: '😂',
  [ReactionType.WOW]: '😮',
  [ReactionType.SAD]: '😢',
  [ReactionType.ANGRY]: '😣',
};

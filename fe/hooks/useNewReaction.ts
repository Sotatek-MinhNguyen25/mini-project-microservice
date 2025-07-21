import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/auth-context';
import { ReactionType } from '@/types/post';
import postService from '@/service/post.service';

export const useNewReaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: ReactionType }) => {
      if (!user) throw new Error('User not authenticated');
      const dummyuserId = 'e63fd118-3b3b-4ac0-96b3-3502239c756f';
      console.log('type', type);
      const response = await postService.addReaction(dummyuserId, postId, type);
      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Success',
        description: 'Reaction updated!',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update reaction',
      });
    },
  });
};
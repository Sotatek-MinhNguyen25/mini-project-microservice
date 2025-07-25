import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import postService from '@/service/post.service';
import {
  GetTagsResponse,
  Post,
  ReactionType,
  ReplyCommentData,
  SubCommentsResponse,
  UseSubCommentsParams,
} from '@/types/post';
import { useToast } from './useToast';
import { useState } from 'react';
import { post } from '@/lib/axiosClient';

interface UseGetPostsOptions {
  limit?: number;
  page?: number;
}

export function useGetPosts({ page = 1, limit = 10 }: UseGetPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', page, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts(pageParam, limit);
      const posts = Array.isArray(response) ? response : response.posts || [];
      const total = Array.isArray(response) ? undefined : response.total;
      return { posts, total, page: pageParam };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.posts.length || lastPage.posts.length < limit) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: any) => {
      const { files, ...rest } = postData;

      let postImages = rest.postImages || [];
      if (files.length > 0) {
        try {
          if (files.length === 1) {
            // Use single file upload endpoint
            const uploadResponse: any = await postService.uploadSingleFile(
              files[0],
            );
            postImages = [
              {
                id: uploadResponse.data.id,
                url: uploadResponse.data.url,
                altText: postImages[0]?.altText || `Image 1`,
              },
            ];
          } else {
            // Use multiple files upload endpoint
            const uploadResponse: any = await postService.uploadMultipleFiles(
              files,
            );
            postImages = (
              uploadResponse.data as Array<{ id: string; url: string }>
            ).map((file, index) => ({
              id: file.id,
              url: file.url,
              altText: postImages[index]?.altText || `Image ${index + 1}`,
            }));
          }
        } catch (error) {
          throw new Error('Failed to upload files to Cloudinary');
        }
      }

      try {
        const createPostData: any = {
          title: rest.title,
          content: rest.content,
          postImages: postImages.length > 0 ? postImages : undefined,
          tagIds:
            rest.tagIds && rest.tagIds.length > 0 ? rest.tagIds : undefined,
        };
        const postResponse = await postService.createPost(createPostData);
        return postResponse;
      } catch (error) {
        throw new Error('Failed to create post');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      postService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetTags() {
  return useQuery<GetTagsResponse, Error>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await postService.getTags();
      return response;
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export const useNewReaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: ReactionType;
    }) => {
      const response = await postService.addReaction(postId, type);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to update reaction');
      }
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

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      postService.addReaction(postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useSubComments({
  parentCommentId,
  limit = 5,
  enabled = true,
}: UseSubCommentsParams) {
  return useInfiniteQuery({
    queryKey: ['subComments', parentCommentId],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await postService.getSubComments(
          parentCommentId,
          pageParam,
          limit,
        );
        return response;
        // Validate response structure
        // if (!response?.data) {
        //   throw new Error('Invalid response structure');
        // }
        return {
          subComments: Array.isArray(response.data.subComments)
            ? response.data.subComments
            : [],
          page: pageParam,
          totalCount: Number(response.data.totalCount) || 0,
        };
      } catch (err) {
        // Wrap errors to ensure consistent error handling
        throw new Error(
          err instanceof Error ? err.message : 'Failed to fetch subcomments',
        );
      }
    },
    getNextPageParam: (lastPage) => {
      if (
        !lastPage.subComments?.length ||
        lastPage.subComments.length < limit
      ) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
    retry: 2, // Retry failed requests twice
  });
}

export function useReplyComment(commentId: string, content: string) {
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await postService.createComment('', content, commentId);
      console.log(response);
      if (response.status === 'success') {
        return response.data;
      } else {
        throw new Error();
      }
    },
    onSuccess: () => {
      // Invalidate sub-comments query để refresh danh sách
      queryClient.invalidateQueries({
        queryKey: ['subComments', commentId],
      });
    },
  });

  const handleSubmitReply = async (content: string) => {
    return replyMutation.mutateAsync(content);
  };

  return {
    replyMutation,
    handleSubmitReply,
  };
}

export const useComment = (postId: string) => {
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      return postService.createComment(postId, content, '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added!',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add comment',
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate({ content: newComment });
  };

  return {
    newComment,
    setNewComment,
    commentMutation,
    handleSubmitComment,
  };
};

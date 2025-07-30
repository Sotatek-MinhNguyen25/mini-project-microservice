import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import postService from '@/service/post.service';
import {
  CreatePostForm,
  CreatePostRequest,
  CreatePostResponseData,
  GetTagsResponse,
  PostImageResponse,
  ReactionType,
  UseGetPostsOptions,
  UseSubCommentsParams,
} from '@/types/post';
import { useToast } from './useToast';
import { useState } from 'react';
import notificationService from '@/service/notification.service';
import type { Notification } from '@/types/notification';
import { ApiResponse } from '@/types/response';

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
    mutationFn: async (postData: CreatePostForm) => {
      const { files, ...rest } = postData;

      let postImages = rest.postImages || [];
      if (files.length > 0) {
        try {
          if (files.length === 1) {
            const uploadResponse: ApiResponse<PostImageResponse> =
              await postService.uploadSingleFile(files[0]);
            postImages = [
              {
                id: uploadResponse.data.id,
                url: uploadResponse.data.url,
                altText: postImages[0]?.altText || `Image 1`,
              },
            ];
          } else {
            const uploadResponse: ApiResponse<PostImageResponse[]> =
              await postService.uploadMultipleFiles(files);
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
        const createPostData: CreatePostRequest = {
          title: rest.title,
          content: rest.content,
          postImages: postImages.length > 0 ? postImages : undefined,
          tagIds:
            rest.tagIds && rest.tagIds.length > 0 ? rest.tagIds : undefined,
        };
        const postResponse: ApiResponse<CreatePostResponseData> =
          await postService.createPost(createPostData);
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
        let hasNextPage = false;
        if (response.currentPage < response.totalPage) {
          hasNextPage = true;
        }
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to fetch subcomments',
        );
      }
    },

    getNextPageParam: (data) => {
      const currentPage = data.meta.currentPage;
      const totalPage = data.meta.totalPage;
      if (currentPage < totalPage) {
        return currentPage + 1;
      }
      return undefined;
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

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { toast } = useToast();
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const fetchNotifications = async (resetPage = true) => {
    try {
      setIsLoadingNotifications(true);
      const currentPage = resetPage ? 1 : page;
      const response: any = await notificationService.getNotification(
        currentPage,
      );
      console.log('response full', response);

      if (response?.data && response?.meta) {
        if (resetPage) {
          setNotifications(response.data);
          setPage(response.meta.currentPage);
          const isLastPage =
            response.meta.currentPage >= response.meta.totalPage;
          console.log('Is last page:', isLastPage);
          setHasMorePages(!isLastPage);
        } else {
          setNotifications((prev) => [...prev, ...response.data]);
        }
        setTotalPages(response.meta.totalPage);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch notifications',
      });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const loadMoreNotifications = async () => {
    if (page >= totalPages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response: any = await notificationService.getNotification(nextPage);

      if (response.status !== 200) {
        throw new Error('Failed to load more notifications');
      }

      if (response?.data && response.meta) {
        // Append new notifications to existing list
        setNotifications((prev) => [...prev, ...response.data]);
        setPage(response.meta.currentPage);
        setTotalPages(response.meta.totalPage);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load more notifications',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const markOneAsRead = async (notificationId: string) => {
    const previousNotifications = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    try {
      const response = await notificationService.markAsReadID(notificationId);
      if (response.status !== 200) {
        throw new Error('Failed to mark notification as read');
      }

      // 3. Success toast (optional)
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });

      return response.data;
    } catch (error) {
      setNotifications(previousNotifications);

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read',
      });
      throw error;
    }
  };

  const markAllAsRead = async () => {
    const previousNotifications: Notification[] = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const response = await notificationService.markAllAsRead();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to mark all notifications as read');
      }

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });

      return response.data;
    } catch (error) {
      setNotifications(previousNotifications);

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all notifications as read',
      });
      throw error;
    }
  };

  return {
    markOneAsRead,
    markAllAsRead,
    notifications,
    isLoadingNotifications,
    isLoadingMore,
    setNotifications,
    setIsLoadingNotifications,
    fetchNotifications,
    loadMoreNotifications,
    toast,
    page,
    setPage,
    totalPages,
    setTotalPages,
    queryClient,
    hasMorePages: hasMorePages,
  };
};

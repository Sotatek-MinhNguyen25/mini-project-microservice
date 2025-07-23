import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import postService from "@/service/post.service"
import { CreatePostRequest, GetTagsResponse, Post, PostData, ReactionType } from "@/types/post"
import axios from "axios";
import { useToast } from "./useToast";
import { DEFAULT_USER } from "@/const/user";

interface PostsResponse {
  posts: Post[];
  total?: number;
}

type PostsResponseData = PostsResponse | Post[];

interface UseGetPostsOptions {
  limit?: number;
  page?: number;
}

export function useGetPosts({ page = 1, limit = 10 }: UseGetPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["posts", page, limit],
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postData: PostData) => {
      const { files, ...rest } = postData

      let postImages = rest.postImages || []
      if (files.length > 0) {
        try {
          if (files.length === 1) {
            // Use single file upload endpoint
            const uploadResponse: any = await postService.uploadSingleFile(files[0])
            postImages = [{ id: uploadResponse.data.id, url: uploadResponse.data.url, altText: postImages[0]?.altText || `Image 1` }]
          } else {
            // Use multiple files upload endpoint
            const uploadResponse: any = await postService.uploadMultipleFiles(files)
            postImages = (uploadResponse.data as Array<{ id: string; url: string }>).map((file, index) => ({
              id: file.id,
              url: file.url,
              altText: postImages[index]?.altText || `Image ${index + 1}`,
            }))
          }
        } catch (error) {
          throw new Error('Failed to upload files to Cloudinary')
        }
      }

      try {
        const createPostData: CreatePostRequest = {
          title: rest.title,
          content: rest.content,
          userId: "e63fd118-3b3b-4ac0-96b3-3502239c756f",
          postImages: postImages.length > 0 ? postImages : undefined,
          tagIds: rest.tagIds && rest.tagIds.length > 0 ? rest.tagIds : undefined,
        }
        const postResponse = await postService.createPost(createPostData)
        return postResponse
      } catch (error) {
        throw new Error('Failed to create post')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => postService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useGetTags() {
  return useQuery<GetTagsResponse, Error>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/tag', {
        headers: {
          accept: '*/*',
        },
      })
      return response.data
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export const useNewReaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = DEFAULT_USER; // Assuming user is available in context or props

  return useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: ReactionType }) => {
      if (!user) throw new Error('User not authenticated');
      const dummyuserId = 'e63fd118-3b3b-4ac0-96b3-3502239c756f';
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

export function useAddReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, type, userId }: { postId: string; type: ReactionType; userId: string }) => postService.addReaction(userId, postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      content,
      parentId,
    }: {
      postId: string
      content: string
      parentId?: string
    }) => postService.createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

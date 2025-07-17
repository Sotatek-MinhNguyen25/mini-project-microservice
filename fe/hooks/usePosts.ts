import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import postService from "@/service/post.service"

export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => postService.getPosts(page, limit),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postData: any) => postService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
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

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useAddReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => postService.addReaction(postId, type),
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => apiClient.getPosts(page, limit),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postData: any) => apiClient.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useAddReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => apiClient.addReaction(postId, type),
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
    }) => apiClient.createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

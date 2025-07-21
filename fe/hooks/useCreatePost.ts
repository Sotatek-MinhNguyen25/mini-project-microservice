import { useMutation, useQueryClient } from '@tanstack/react-query'
import postService from '@/service/post.service'
import { PostData, CreatePostRequest } from '@/types/post'

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
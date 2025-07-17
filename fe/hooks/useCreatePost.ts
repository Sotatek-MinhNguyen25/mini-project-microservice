import { useMutation, useQueryClient } from '@tanstack/react-query'
import postService from '@/service/post.service'
import { CloudinaryResponse, PostData } from '@/types/auth'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postData: PostData) => {
      const { files, ...rest } = postData

      let mediaUrls: string[] = []
      if (files.length > 0) {
        try {
          if (files.length === 1) {
            // Use single file upload endpoint for one file
            const uploadResponse: CloudinaryResponse = await postService.uploadSingleFile(files[0])
            mediaUrls = [uploadResponse.url]
          } else {
            // Use multiple files upload endpoint for more than one file
            const uploadResponse: CloudinaryResponse[] = await postService.uploadMultipleFiles(files)
            mediaUrls = uploadResponse.map((file) => file.url)
          }
        } catch (error) {
          throw new Error('Failed to upload files to Cloudinary')
        }
      }

      try {
        const postResponse = await postService.createPost({
          ...rest,
          mediaUrls,
        })
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

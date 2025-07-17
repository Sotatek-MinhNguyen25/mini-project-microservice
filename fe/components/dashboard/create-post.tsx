'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/useToast'
import CompactPostView from '../../components/dashboard/createPost/CompactPostView'
import PostFormHeader from '../../components/dashboard/createPost/PostFormHeader'
import PostFormFields from '../../components/dashboard/createPost/PostFormFields'
import PostTagsInput from '../../components/dashboard/createPost/PostTagsInput'
import PostFileUpload from '../../components/dashboard/createPost/PostFileUpload'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { useCreatePost } from '@/hooks/useCreatePost'
import { FilePreview } from '@/types'

export function CreatePost() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [content, setContent] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState<string>('')
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { mutate: createPost, isPending } = useCreatePost()

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      const newTag = currentTag.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      files.forEach((file) => {
        const url = URL.createObjectURL(file)
        const type = file.type.startsWith('image/') ? 'image' : 'video'
        setFilePreviews((prev) => [...prev, { file, url, type }])
      })
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFilePreviews((prev) => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove)
      URL.revokeObjectURL(prev[indexToRemove].url)
      return newPreviews
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in content and select a category',
        variant: 'destructive',
      })
      return
    }

    createPost(
      {
        title: title || 'Untitled Post',
        content,
        category,
        tags,
        files: filePreviews.map((p) => p.file),
        authorId: user?.id,
      },
      {
        onSuccess: () => {
          setContent('')
          setTitle('')
          setCategory('')
          setTags([])
          setCurrentTag('')
          setFilePreviews([])
          setIsExpanded(false)
          toast({
            title: 'Success! 🎉',
            description: 'Your post has been shared with the world!',
          })
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create post',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (!user) return null

  const fullName = `${user.profile.firstName} ${user.profile.lastName}`

  return isExpanded ? (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <PostFormHeader fullName={fullName} user={user} setIsExpanded={setIsExpanded} />
      <PostFormFields
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        content={content}
        setContent={setContent}
      />
      <PostTagsInput
        tags={tags}
        currentTag={currentTag}
        setCurrentTag={setCurrentTag}
        handleTagKeyDown={handleTagKeyDown}
        removeTag={removeTag}
      />
      <PostFileUpload
        filePreviews={filePreviews}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
      />
      <div className="flex justify-between items-center pt-4 border-t border-border/40">
        <Button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={!content.trim() || !category || isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Sharing...' : 'Share Post'} ✨
        </Button>
      </div>
    </form>
  ) : (
    <CompactPostView user={user} fullName={fullName} setIsExpanded={setIsExpanded} />
  )
}

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PostFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
}

export default function PostFormFields({
  title,
  setTitle,
  content,
  setContent,
}: PostFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Title (Optional)
        </Label>
        <Input
          id="title"
          placeholder="Give your post a catchy title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 border-border/40 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>
      <div>
        <Label htmlFor="content" className="text-sm font-medium">
          Content *
        </Label>
        <Textarea
          id="content"
          placeholder="What's on your mind? Share your thoughts, experiences, or anything interesting..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          className="mt-1 border-border/40 focus:border-primary/50 focus:ring-primary/20 resize-none"
        />
      </div>
    </>
  )
}
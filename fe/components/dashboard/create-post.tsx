"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, ImageIcon, Video, X, Plus } from "lucide-react"

const CATEGORIES = [
  { value: "programming", label: "💻 Lập trình", emoji: "💻" },
  { value: "cooking", label: "🍳 Nấu ăn", emoji: "🍳" },
  { value: "travel", label: "✈️ Du lịch", emoji: "✈️" },
  { value: "sports", label: "⚽ Thể thao", emoji: "⚽" },
  { value: "music", label: "🎵 Âm nhạc", emoji: "🎵" },
  { value: "movies", label: "🎬 Phim ảnh", emoji: "🎬" },
  { value: "books", label: "📚 Sách", emoji: "📚" },
  { value: "technology", label: "🔧 Công nghệ", emoji: "🔧" },
  { value: "lifestyle", label: "🌟 Lifestyle", emoji: "🌟" },
  { value: "health", label: "💪 Sức khỏe", emoji: "💪" },
]

interface FilePreview {
  file: File
  url: string
  type: "image" | "video"
}

export function CreatePost() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { id: Date.now().toString(), ...postData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      // Reset form
      setContent("")
      setTitle("")
      setCategory("")
      setTags([])
      setCurrentTag("")
      setFilePreviews([])
      setIsExpanded(false)
      toast({
        title: "Success! 🎉",
        description: "Your post has been shared with the world!",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    },
  })

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault()
      const newTag = currentTag.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setCurrentTag("")
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
        const type = file.type.startsWith("image/") ? "image" : "video"

        setFilePreviews((prev) => [...prev, { file, url, type }])
      })
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFilePreviews((prev) => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove)
      // Clean up URL
      URL.revokeObjectURL(prev[indexToRemove].url)
      return newPreviews
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in content and select a category",
        variant: "destructive",
      })
      return
    }

    createPostMutation.mutate({
      title: title || "Untitled Post",
      content,
      category,
      tags,
      files: filePreviews.map((p) => p.file),
      authorId: user?.id,
    })
  }

  if (!user) return null

  const fullName = `${user.profile.firstName} ${user.profile.lastName}`
  const initials = `${user.profile.firstName[0]}${user.profile.lastName[0]}`

  // Collapsed state - Facebook style
  if (!isExpanded) {
    return (
      <Card
        className="glass-effect border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarImage src={user.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 rounded-full px-4 py-3 text-muted-foreground hover:bg-muted/70 transition-colors">
              What's on your mind, {user.profile.firstName}?
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                <ImageIcon className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expanded state - Full form
  return (
    <Card className="glass-effect border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarImage src={user.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                {fullName}
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </p>
              <p className="text-sm text-muted-foreground">Share something amazing with the world!</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="hover:bg-muted/50">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1 border-border/40 focus:border-primary/50">
                <SelectValue placeholder="Select a category for your post" />
              </SelectTrigger>
              <SelectContent className="glass-effect">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="cursor-pointer">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Tags Input */}
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <div className="mt-1 space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                placeholder="Type a tag and press Enter..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="border-border/40 focus:border-primary/50 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <div className="border-2 border-dashed border-border/40 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground mr-2" />
                <Video className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-primary/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Photos/Videos
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Support: PNG, JPG, GIF, MP4, MOV • Max: 10MB per file
              </p>
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {preview.type === "image" ? (
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video src={preview.url} className="w-full h-full object-cover" muted />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {preview.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!content.trim() || !category || createPostMutation.isPending}
            >
              {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createPostMutation.isPending ? "Sharing..." : "Share Post"} ✨
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

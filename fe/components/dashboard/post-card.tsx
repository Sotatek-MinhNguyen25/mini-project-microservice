"use client"

import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/contexts/auth-context"
import type { Post, PostCardProps } from "@/types/post"
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { CommentSection } from "./comment-section"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CATEGORY_LABELS } from "@/const/category"

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const reactionMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast({
        title: "Success",
        description: "Reaction updated!",
      })
    },
  })

  const handleReaction = (type: "LIKE" | "LOVE" | "LAUGH" | "ANGRY" | "SAD") => {
    if (!user) return
    reactionMutation.mutate({ postId: post.id, type })
  }

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const userReaction = post.reactions.find((r) => r.userId === user?.id)
  const fullName = `${post.author.profile.firstName} ${post.author.profile.lastName}`
  const initials = `${post.author.profile.firstName[0]}${post.author.profile.lastName[0]}`

  // Get category info
  const categoryInfo = post.categories[0] ? CATEGORY_LABELS[post.categories[0].name] : null

  return (
    <Card className="card-hover glass-effect border-0 shadow-lg overflow-hidden">
      {/* Category Header - Elegant and refined */}
      {categoryInfo && (
        <div className="px-6 py-4 bg-gradient-to-r from-background via-muted/30 to-background border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full ${categoryInfo.color}/10 flex items-center justify-center border border-${categoryInfo.color}/20`}
              >
                <span className="text-lg">{categoryInfo.emoji}</span>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Category</p>
                <p className="font-semibold text-foreground">{categoryInfo.label}</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`${categoryInfo.color}/10 text-${categoryInfo.color} border-${categoryInfo.color}/20 hover:${categoryInfo.color}/20 transition-colors`}
            >
              {categoryInfo.emoji} {categoryInfo.label}
            </Badge>
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="px-6 pt-4 pb-2 bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarImage src={post.author.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                @{post.author.username}
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                {formatDistanceToNow(post.createdAt)} ago
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-effect">
              <DropdownMenuItem>📋 Copy link</DropdownMenuItem>
              <DropdownMenuItem>🚨 Report</DropdownMenuItem>
              {user?.id === post.authorId && (
                <>
                  <DropdownMenuItem>✏️ Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">🗑️ Delete</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6">
        {post.title && (
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {post.title}
          </h3>
        )}

        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {post.images.length > 0 && (
          <div className="grid gap-3 rounded-xl overflow-hidden">
            {post.images.map((image) => (
              <div key={image.id} className="relative group">
                {image.mimeType.startsWith("video/") ? (
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      src={image.url}
                      className="w-full h-auto max-h-96 object-cover"
                      muted={isMuted}
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleVideo}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleMute}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText}
                    width={image.width}
                    height={image.height}
                    className="rounded-xl object-cover w-full max-h-96 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {image.caption && <p className="text-sm text-muted-foreground mt-2 italic">💬 {image.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            <Button
              variant={userReaction?.type === "LIKE" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction("LIKE")}
              disabled={reactionMutation.isPending}
              className={`transition-all duration-200 ${
                userReaction?.type === "LIKE"
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                  : "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              }`}
            >
              <Heart
                className={`h-4 w-4 mr-2 transition-all ${userReaction?.type === "LIKE" ? "fill-current scale-110" : ""}`}
              />
              {post._count.reactions}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-all"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {post._count.comments}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20 transition-all"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full pt-4 border-t border-border/40">
            <CommentSection postId={post.id} comments={post.comments} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

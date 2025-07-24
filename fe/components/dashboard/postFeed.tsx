'use client'

import { useEffect, useRef } from 'react'
import { useGetPosts } from '@/hooks/usePosts'
import { PostCard } from './postCard'
import { Loader2, Sparkles } from 'lucide-react'

export function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useGetPosts({ page:1, limit: 10 })
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])


  const allPosts = data?.pages.flatMap((page) => page.posts) || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading amazing posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-400">Failed to load posts. Please try again.</p>
        </div>
      </div>
    )
  }

  if (!allPosts.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground text-lg">No posts yet. Be the first to share something amazing!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {allPosts.map((post, index) => (
        <div
          key={post.id}
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PostCard post={post} />
        </div>
      ))}
      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

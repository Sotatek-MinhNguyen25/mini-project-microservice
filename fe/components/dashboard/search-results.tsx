"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PostCard } from "./postCard"
import type { Post } from "@/types/post"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FILTER_CATEGORIES } from "@/const/category"
import { SearchResultsProps } from "@/types"

export function SearchResults({ query, onClose }: SearchResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", query, selectedCategory, sortBy],
    queryFn: async () => {
      // Mock search API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock search results - in real app, this would be an API call
      const mockResults = {
        posts: [] as Post[], // Would contain filtered posts
        users: [],
        tags: query.split(" ").map((tag) => ({ name: tag, count: Math.floor(Math.random() * 100) })),
        totalResults: 0,
      }

      return mockResults
    },
    enabled: !!query.trim(),
  })

  if (!query.trim()) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg shadow-xl border">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Search className="h-6 w-6" />
                Search Results for "{query}"
              </h2>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="relevant">Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Searching...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">Failed to search. Please try again.</div>
            ) : results?.totalResults === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">Try different keywords or browse by category</p>

                {/* Suggested tags */}
                {results?.tags && results.tags.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">Related tags:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {results.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          #{tag.name} ({tag.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-muted-foreground">Found {results?.totalResults} results</p>
                {results?.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

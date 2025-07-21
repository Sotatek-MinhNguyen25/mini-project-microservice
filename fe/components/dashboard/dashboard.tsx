'use client'

import { Header } from './header'
import { PostFeed } from './postFeed'
import { CreatePost } from './createPosts'
import Link from "next/link"

export function Dashboard() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          <CreatePost />
          <PostFeed />
        </div>
      </main>
    </div>
  )
}

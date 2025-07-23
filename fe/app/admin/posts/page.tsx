"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PostTable } from "@/components/admin/posts/post-table"
import { PostForm } from "@/components/admin/posts/post-form"
import { Modal } from "@/components/admin/ui/modal"
import { Pagination } from "@/components/admin/ui/pagination"
import type { Post } from "@/types/post"
import { usePostsManagement } from "@/hooks/usePostManage"

export default function PostsPage() {
  const { posts, loading, error, pagination, fetchPosts, createPost, updatePost, deletePost } = usePostsManagement()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const handleCreatePost = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDeletePost = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(id)
    }
  }

  const handleSubmit = async (postData: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, postData)
      } else {
        await createPost(postData)
      }
      setIsModalOpen(false)
      setEditingPost(null)
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handlePageChange = (page: number) => {
    fetchPosts(page, pagination.limit)
  }

  return (
    <div className="flex-col mx-auto py-4 px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
        <button
          onClick={handleCreatePost}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow">
        <PostTable posts={posts} onEdit={handleEditPost} onDelete={handleDeletePost} loading={loading} />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? "Edit Post" : "Create Post"}
      >
        <PostForm
          post={editingPost || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  )
}

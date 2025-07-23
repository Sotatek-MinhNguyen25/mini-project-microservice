'use client';

import { post } from '@/lib/axiosClient';
import postService from '@/service/post.service';
import { Post } from '@/types/post';
import { useState, useEffect } from 'react';

export function usePostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPosts = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await postService.getPostsAdmin(page, limit);
      console.log('Fetched posts:', response);
      if (response.statusCode === 200) {
        setPosts(response.data);
        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.totalItem,
          totalPages: response.meta.totalPage,
        });
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (
    postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.createPost(postData);

      if (response.ok) {
        await fetchPosts(pagination.page, pagination.limit);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, postData: Partial<Post>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.updatePost(id, postData);

      if (response.ok) {
        await fetchPosts(pagination.page, pagination.limit);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.deletePost(id);

      if (response.ok) {
        await fetchPosts(pagination.page, pagination.limit);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}

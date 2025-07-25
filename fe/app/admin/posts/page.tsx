'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PostTable } from '@/components/admin/posts/post-table';
// import { Pagination } from '@/components/admin/ui/pagination'; // <-- Remove this import
import type { Post } from '@/types/post';
import {
  useCreatePost,
  useDeletePost,
  useGetPosts, // Đây vẫn là hook dùng useInfiniteQuery
  useUpdatePost,
} from '@/hooks/usePosts';

export default function PostsPage() {
  // `limit` có thể vẫn được quản lý nếu bạn muốn người dùng thay đổi số lượng bài trên mỗi lần tải
  const [currentLimit, setCurrentLimit] = useState(10); // Ví dụ: giới hạn mặc định 10 bài/trang

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage, // <-- Hàm để tải trang kế tiếp
    hasNextPage, // <-- Kiểm tra xem có trang kế tiếp không
    isFetchingNextPage, // <-- Trạng thái đang tải trang kế tiếp
    isRefetching, // Để biết khi nào đang refetch toàn bộ query (khi invalidate)
  } = useGetPosts({ limit: currentLimit }); // Truyền limit vào đây

  // `posts` là mảng phẳng của tất cả các bài viết từ tất cả các trang đã tải
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // `loading` tổng thể khi mới tải lần đầu
  const loading = isLoading;

  // Sử dụng các trạng thái loading riêng cho các mutation để điều khiển UI chính xác hơn
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
      } catch (err) {
        console.error('Error deleting post:', err);
        // Display error to user if needed
      }
    }
  };

  // Hàm này giờ sẽ gọi fetchNextPage thay vì cố gắng thay đổi `page` trực tiếp
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Bạn có thể thêm một hàm để thay đổi limit nếu muốn
  const handleChangeLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLimit(Number(e.target.value));
    // Khi `currentLimit` thay đổi, useInfiniteQuery sẽ fetch lại từ đầu
    // với `initialPageParam: 1` và `limit` mới.
  };

  return (
    <div className="flex-col mx-auto py-4 px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
      </div>

      {/* Tùy chọn để thay đổi giới hạn bài viết trên mỗi lần tải */}
      <div className="mb-4">
        <label htmlFor="post-limit" className="mr-2">
          Bài viết mỗi lần tải:
        </label>
        <select
          id="post-limit"
          value={currentLimit}
          onChange={handleChangeLimit}
          className="p-2 border rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <PostTable
          posts={posts}
          onDelete={handleDeletePost}
          loading={loading || isRefetching} // `isLoading` cho lần tải đầu, `isRefetching` cho các lần refetch sau
          // `isDeleting` cũng có thể được xem xét để làm mờ bảng hoặc dòng bị xóa
        />

        {/* Nút "Load More" (Tải thêm) */}
        {hasNextPage && ( // Chỉ hiển thị nếu còn trang kế tiếp
          <div className="p-4 border-t text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage} // Vô hiệu hóa nút khi đang tải trang kế tiếp
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isFetchingNextPage ? 'Đang tải thêm...' : 'Tải thêm bài viết'}
            </button>
          </div>
        )}
        {/* Có thể thêm một spinner hoặc thông báo khi đang tải thêm */}
        {isFetchingNextPage &&
          !loading && ( // Chỉ hiển thị khi đang tải thêm, không phải tải ban đầu
            <div className="text-center p-2 text-gray-500">
              Đang tải thêm...
            </div>
          )}

        {/* <Pagination /> component không còn phù hợp với useInfiniteQuery nữa, nên bỏ qua */}
        {/* {pagination.totalPages > 1 && (
           <div className="p-4 border-t">
             <Pagination
               currentPage={pagination.page}
               totalPages={pagination.totalPages}
               onPageChange={handlePageChange}
             />
           </div>
         )} */}
      </div>
    </div>
  );
}

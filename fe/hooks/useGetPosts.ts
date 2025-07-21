import { useInfiniteQuery } from "@tanstack/react-query";
import postService from "@/service/post.service"; // Adjust path to your postService
import type { Post } from "@/types/post";

// Define possible API response types
interface PostsResponse {
  posts: Post[];
  total?: number;
}

type PostsResponseData = PostsResponse | Post[];

interface UseGetPostsOptions {
  limit?: number;
  page?: number;
}

export function useGetPosts({ page = 1, limit = 10 }: UseGetPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["posts", page, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts(pageParam, limit);
      const posts = Array.isArray(response) ? response : response.posts || [];
      const total = Array.isArray(response) ? undefined : response.total;
      return { posts, total, page: pageParam };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.posts.length || lastPage.posts.length < limit) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
}

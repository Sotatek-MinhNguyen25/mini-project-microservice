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
}

export function useGetPosts({ limit = 10 }: UseGetPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["posts", limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts(pageParam, limit);
      // Handle both response formats
      const posts = Array.isArray(response) ? response : response.posts || [];
      const total = Array.isArray(response) ? undefined : response.total;
      // console.log("Fetched posts:", posts, "Total:", total);
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

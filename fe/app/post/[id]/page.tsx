'use client';
import { PostCard } from '@/components/dashboard/postCard';
import postService from '@/service/post.service';
import { useParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useQuery } from '@tanstack/react-query';

const page = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: post } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(id),
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">{post && <PostCard post={post} />}</div>
      </main>
    </div>
  );
};

export default page;

'use client';
import { PostCard } from '@/components/dashboard/postCard';
import postService from '@/service/post.service';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/types/post';
import { Header } from '@/components/dashboard/header';

const page = () => {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post>();
  useEffect(() => {
    const getPost = async () => {
      const response = await postService.getPostById(id);
      setPost(response);
    };
    getPost();
  }, [id]);
  console.log(post);
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

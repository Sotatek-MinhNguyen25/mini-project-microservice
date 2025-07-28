'use client';
import { PostCard } from '@/components/dashboard/postCard';
import postService from '@/service/post.service';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/types/post';

const page = () => {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post>();
  useEffect(() => {
    const getPost = async () => {
      const response = await postService.getPostById(id);
      console.log(response);
      setPost(response);
    };
    getPost();
  }, [post]);
  return <div className="w-full">{post && <PostCard post={post} />}</div>;
};

export default page;

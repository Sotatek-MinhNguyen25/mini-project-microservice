'use client';

import { Card } from '@/components/ui/card';
import { Post } from '@/types/post';
import { PostTags } from './postDetail/PostTags';
import { PostHeader } from './postDetail/PostHeader';
import { PostContent } from './postDetail/PostContent';
import { PostFooter } from './postDetail/PostFooter';

export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="card-hover glass-effect border-0 shadow-lg overflow-hidden">
      <PostHeader post={post} />
      <PostContent post={post} />
      <PostFooter post={post} />
    </Card>
  );
}

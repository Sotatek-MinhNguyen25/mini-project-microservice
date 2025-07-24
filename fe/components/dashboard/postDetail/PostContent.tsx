import { Post } from '@/types/post';
import { PostText } from './PostText';
import { ImageGrid } from './ImageGrid';
import { PostTags } from './PostTags';

export function PostContent({ post }: { post: Post }) {
  return (
    <div className="space-y-4 px-6">
      <PostText title={post.title} content={post.content} />
      <PostTags tags={post.tags} />
      <ImageGrid images={post.image} />
    </div>
  );
}
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types/post';

export function PostTags({ tags }: { tags: Post['tags'] }) {
  if (!tags.length) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag:any) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            #{tag.name}
          </Badge>
        ))} 
      </div>
    </div>
  );
}
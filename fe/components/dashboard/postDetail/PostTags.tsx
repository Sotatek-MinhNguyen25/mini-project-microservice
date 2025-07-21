import { Badge } from '@/components/ui/badge';
import { Post } from '@/types/post';

export function PostTags({ tags }: { tags: Post['tags'] }) {
  if (!tags.length) return null;

  return (
    <div className="px-6 pt-4 pb-2 bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.tag.id}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            #{tag.tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
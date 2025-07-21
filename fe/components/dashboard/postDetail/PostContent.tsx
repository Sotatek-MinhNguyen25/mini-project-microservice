import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Post } from '@/types/post';

export function PostContent({ post }: { post: Post }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200; // Maximum characters before truncating
  const isLongContent = post.content.length > MAX_LENGTH;

  return (
    <div className="space-y-4 px-6">
      {post.title && (
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {post.title}
        </h3>
      )}

      <div>
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {isExpanded || !isLongContent ? post.content : `${post.content.slice(0, MAX_LENGTH)}...`}
        </p>
        {isLongContent && (
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>

      {post.image.length > 0 && (
        <div className="grid gap-3 rounded-xl overflow-hidden">
          {post.image.map((image) => (
            <div key={image.id} className="relative group">
              <Image
                src={image.url || '/placeholder.svg'}
                alt={image.altText}
                width={800}
                height={600}
                className="rounded-xl object-cover w-full max-h-96 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
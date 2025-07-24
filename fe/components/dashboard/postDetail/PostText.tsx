import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PostTextProps {
  title?: string;
  content: string;
}

export function PostText({ title, content }: PostTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;
  const isLongContent = content.length > MAX_LENGTH;

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {title}
        </h3>
      )}

      <div>
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {isExpanded || !isLongContent ? content : `${content.slice(0, MAX_LENGTH)}...`}
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
    </div>
  );
}

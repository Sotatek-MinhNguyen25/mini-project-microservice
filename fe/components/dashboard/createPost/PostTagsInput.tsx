import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { PostTagsInputProps } from '@/types/post'

export default function PostTagsInput({
  tags,
  currentTag,
  setCurrentTag,
  handleTagKeyDown,
  removeTag,
}: PostTagsInputProps) {
  return (
    <div>
      <Label className="text-sm font-medium">Tags</Label>
      <div className="mt-1 space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          placeholder="Type a tag and press Enter..."
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="border-border/40 focus:border-primary/50 focus:ring-primary/20"
        />
        <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
      </div>
    </div>
  )
}

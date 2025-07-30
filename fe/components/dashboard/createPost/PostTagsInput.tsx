'use client';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Check, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { Tag } from '@/types/post';

interface PostTagsInputProps {
  tags: string[];
  availableTags: Tag[];
  handleTagSelect: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  isLoading: boolean;
}

export default function PostTagsInput({
  tags,
  availableTags,
  handleTagSelect,
  removeTag,
  isLoading,
}: PostTagsInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags
      </Label>
      <Select.Root onValueChange={handleTagSelect} disabled={isLoading}>
        <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:border-primary/50 focus:ring-primary/20">
          <Select.Value
            placeholder={isLoading ? 'Loading tags...' : 'Select a tag...'}
          />
          <Select.Icon>
            <ChevronDown className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <Select.Viewport>
            {availableTags.map((tag) => (
              <Select.Item
                key={tag.id}
                value={tag.id}
                className="flex items-center px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                <Select.ItemText>{tag.name}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="h-4 w-4 ml-2" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tagId) => {
            const tag = availableTags.find((t) => t.id === tagId);
            return (
              <Badge
                key={tagId}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                #{tag ? tag.name : tagId}
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading tags...</p>
      )}
    </div>
  );
}

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES } from '@/const/category'
import { PostFormFieldsProps } from '@/types/post'

export default function PostFormFields({
  title,
  setTitle,
  category,
  setCategory,
  content,
  setContent,
}: PostFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Title (Optional)
        </Label>
        <Input
          id="title"
          placeholder="Give your post a catchy title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 border-border/40 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>
      <div>
        <Label htmlFor="category" className="text-sm font-medium">
          Category *
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1 border-border/40 focus:border-primary/50">
            <SelectValue placeholder="Select a category for your post" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="cursor-pointer">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="content" className="text-sm font-medium">
          Content *
        </Label>
        <Textarea
          id="content"
          placeholder="What's on your mind? Share your thoughts, experiences, or anything interesting..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          className="mt-1 border-border/40 focus:border-primary/50 focus:ring-primary/20 resize-none"
        />
      </div>
    </>
  )
}

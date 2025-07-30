import { CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, X } from 'lucide-react';
import { PostFormHeaderProps } from '@/types/post';
import { DEFAULT_USER } from '@/const/user';

export default function PostFormHeader({
  user,
  setIsExpanded,
}: PostFormHeaderProps) {
  const initials = `${user.username[0]}${user.username[1]}`;

  return (
    <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              Share something amazing with the world!
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}

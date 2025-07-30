import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, PUser } from '@/types/post';
import { DEFAULT_USER as DEFAULT_USER } from '@/const/user';

export function PostHeader({ post }: { post: Post }) {
  const { user } = post;
  const displayUser: PUser = user ? user : DEFAULT_USER;
  displayUser.initials =
    displayUser.initials ||
    (displayUser.username?.length >= 2
      ? `${displayUser.username[0]}${displayUser.username[1]}`.toUpperCase()
      : displayUser.username?.[0]?.toUpperCase() || 'NA'); // fallback
  console.log('displayUser', displayUser);

  return (
    <div className="pb-3 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-primary/20">
            <AvatarImage src={displayUser.avatar} alt="avatar" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
              {displayUser.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">
              {displayUser.username}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {formatDistanceToNow(post.createdAt)} ago
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-muted/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-effect">
            <DropdownMenuItem>📋 Copy link</DropdownMenuItem>
            <DropdownMenuItem>🚨 Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

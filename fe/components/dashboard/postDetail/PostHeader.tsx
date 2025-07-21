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
import { Post } from '@/types/post';

// Placeholder user data (since author data is not available)
const DUMMY_USER = {
  name: 'Dummy User',
  username: 'dummyuser',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_nLCu85ayoTKwYw6alnvrockq5QBT2ZWR2g&s',
  initials: 'DU',
};

export function PostHeader({ post }: { post: Post }) {
  return (
    <div className="pb-3 px-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-primary/20">
            <AvatarImage src={DUMMY_USER.avatar} alt="avatar" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
              {DUMMY_USER.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{DUMMY_USER.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              @{DUMMY_USER.username}
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
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
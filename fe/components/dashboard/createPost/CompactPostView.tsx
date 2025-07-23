
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Video } from "lucide-react";
import { CompactPostViewProps } from "@/types/post";

export default function CompactPostView({ user, fullName, setIsExpanded }: CompactPostViewProps) {
  const initials = `${user.username[0]}${user.username[1]}`;

  return (
    <Card
      className="glass-effect border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => setIsExpanded(true)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-primary/20">
            <AvatarImage src={user.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted/50 rounded-full px-4 py-3 text-muted-foreground hover:bg-muted/70 transition-colors">
            What's on your mind, {user.profile.firstName}?
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
              <ImageIcon className="h-4 w-4 mr-1" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
  );
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProfileHeaderProps } from "@/types/auth"
import { Edit, Calendar, Mail, UserIcon, Shield, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`
  const initials = `${user.profile.firstName[0]}${user.profile.lastName[0]}`

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "USER":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600"
      case "INACTIVE":
        return "text-yellow-600"
      case "BANNED":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="glass-effect border-0 shadow-lg overflow-hidden">
      {/* Cover Background */}
      <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                  {user.status === "ACTIVE" && <CheckCircle className={`h-5 w-5 ${getStatusColor(user.status)}`} />}
                </div>
                <p className="text-muted-foreground mb-2">@{user.username}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={getRoleColor(user.roles)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.roles}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>

              <Button onClick={onEditClick} className="shrink-0">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.profile.bio && (
          <div className="mt-6">
            <p className="text-foreground/90 leading-relaxed">{user.profile.bio}</p>
          </div>
        )}

        {/* User Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span>@{user.username}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDistanceToNow(user.createdAt)} ago</span>
          </div>

          {user.oauthProvider && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Connected via {user.oauthProvider}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">48</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">23</div>
            <div className="text-sm text-muted-foreground">Comments</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

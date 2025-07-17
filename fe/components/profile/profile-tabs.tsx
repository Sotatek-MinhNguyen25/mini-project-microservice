"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/types/auth"
import { FileText, Heart, MessageCircle, Settings, Activity } from "lucide-react"


export function ProfileTabs( user: User ) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-muted/50">
        <TabsTrigger value="posts" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="likes" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Liked
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>My Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Start sharing your thoughts!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Heart className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    You liked a post by <strong>Jane Doe</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    You commented on <strong>Mike Johnson's</strong> post
                  </p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileText className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    You created a new post in <strong>Programming</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Liked Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No liked posts yet. Start exploring!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="grid gap-6">
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-muted-foreground">Profile visibility</p>
                </div>
                <Badge variant="outline">Public</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Extra security for your account</p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                  Delete Account
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

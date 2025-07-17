"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/useToast"
import type { EditProfileModalProps } from "@/types/auth"
import { Camera, Loader2 } from "lucide-react"

export function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    username: user.username,
    email: user.email,
    bio: user.profile.bio,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return { success: true, data }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      toast({
        title: "Success! 🎉",
        description: "Your profile has been updated successfully!",
      })
      onClose()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      ...formData,
      avatar: avatarFile,
    })
  }

  const fullName = `${formData.firstName} ${formData.lastName}`
  const initials = `${formData.firstName[0]}${formData.lastName[0]}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and avatar. Changes will be saved to your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={avatarPreview || user.profile.avatarUrl || "/placeholder.svg"} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <p className="text-sm text-muted-foreground text-center">
              Click the camera icon to change your profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="border-border/40 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="border-border/40 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="border-border/40 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">Your username will be displayed as @{formData.username}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="border-border/40 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about yourself..."
              className="border-border/40 focus:border-primary/50 resize-none"
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
          </div>

          {/* Account Info Display */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Account Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Role:</span>
                <span className="ml-2 font-medium">{user.roles}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium">{user.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Member since:</span>
                <span className="ml-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.oauthProvider && (
                <div>
                  <span className="text-muted-foreground">Connected via:</span>
                  <span className="ml-2 font-medium">{user.oauthProvider}</span>
                </div>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

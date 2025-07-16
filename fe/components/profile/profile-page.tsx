"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/dashboard/header"
import { ProfileHeader } from "./profile-header"
import { ProfileTabs } from "./profile-tabs"
import { EditProfileModal } from "./edit-profile-modal"
import { Loader2 } from "lucide-react"

export function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <ProfileHeader user={user} onEditClick={() => setIsEditModalOpen(true)} />
          <ProfileTabs user={user} />
        </div>
      </main>

      <EditProfileModal user={user} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}

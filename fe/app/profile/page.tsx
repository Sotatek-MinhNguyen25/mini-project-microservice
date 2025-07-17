"use client"

import { ProfilePage } from "@/components/profile/profile-page"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}

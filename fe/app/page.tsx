"use client"

import { Dashboard } from "@/components/dashboard/dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
      <Toaster />
    </ProtectedRoute>
  )
}

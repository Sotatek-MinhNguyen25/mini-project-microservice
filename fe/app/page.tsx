"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthPage } from "@/components/auth/authPage"
import { Dashboard } from "@/components/dashboard/dashboard"
import { Loader2 } from "lucide-react"
import Loading from "@/components/loading"
import { useRouter } from "next/router"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

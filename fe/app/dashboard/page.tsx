'use client'

import { Dashboard } from '@/components/dashboard/dashboard'
import Loading from '@/components/loading'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const { isLoading } = useAuth()
  if (isLoading) {
    return <Loading />
  }
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

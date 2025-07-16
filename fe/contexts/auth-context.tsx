"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API
      const mockUser: User = {
        id: "1",
        email,
        username: email.split("@")[0],
        roles: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        oauthProvider: null,
        oauthProviderId: null,
        profile: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          bio: "Software developer",
          avatarUrl: "/placeholder.svg?height=40&width=40",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      localStorage.setItem("auth_token", "mock_token")
      localStorage.setItem("user_data", JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API
      const mockUser: User = {
        id: "1",
        email: userData.email,
        username: userData.username,
        roles: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        oauthProvider: null,
        oauthProviderId: null,
        profile: {
          id: "1",
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: "",
          avatarUrl: "/placeholder.svg?height=40&width=40",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      localStorage.setItem("auth_token", "mock_token")
      localStorage.setItem("user_data", JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      throw new Error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export interface User {
  id: string
  email: string
  username: string
  roles: "USER" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "BANNED"
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  oauthProvider: "GOOGLE" | "FACEBOOK" | null
  oauthProviderId: string | null
  profile: UserProfile
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  bio: string
  avatarUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface RefreshToken {
  id: string
  token: string
  expiresAt: Date
  isRevoked: boolean
  createdAt: Date
  userId: string
}

export interface OTP {
  id: string
  code: string
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  expiresAt: Date
  createdAt: Date
  userId: string
}

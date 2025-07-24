export interface User {
  id: string
  email: string
  username: string
  roles: string[]
  status: 'VERIFIED' | 'UNVERIFIED' | 'DELETED'
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  oauthProvider: 'GOOGLE' | 'FACEBOOK' | null
  oauthProviderId: string | null
  profile: UserProfile
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
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
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'
  expiresAt: Date
  createdAt: Date
  userId: string
}

export interface PostData {
  title: string
  content: string
  category: string
  tags: string[]
  files: File[]
  authorId?: string
}

export interface CloudinaryResponse {
  url: string
  public_id: string
  resource_type: string
  fileType: string
  fileName: string
}

export interface EditProfileModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export interface ProfileHeaderProps {
  user: User
  onEditClick: () => void
}

export interface RegisterData {
  email: string
  username: string
  password: string
  otp?: string
  // firstName: string
  // lastName: string
}

export interface RegisterResponse {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  [key: string]: any
}

export interface ResetPasswordData {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
  [key: string]: any;
}

export interface MutationOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: unknown) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse {
  statusCode: number;
  data: LoginResponse;
  message?: string;
}

export interface DecodedToken {
  email: string;
  roles: string[];
  exp: number;
  username: string;
  sub:string;
}
import { RefObject } from 'react'

export interface Errors {
  email?: string
  otp?: string
  password?: string
  confirmPassword?: string
}

export interface EmailInputStepProps {
  email: string
  setEmail: (email: string) => void
  errors: { email?: string }
  handleEmailSubmit: () => void
  isLoading: boolean
}

export interface NewPasswordStepProps {
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  errors: { password?: string; confirmPassword?: string }
  handlePasswordSubmit: () => void
  isLoading: boolean
}

export interface OtpVerificationStepProps {
  otp: string[]
  setOtp: (otp: string[]) => void
  email: string
  errors: { otp?: string }
  countdown: number
  handleResendOtp: () => void
  handleOtpSubmit: (otpCode?: string) => void
  otpRefs: RefObject<(HTMLInputElement | null)[]>
}

export interface FilePreview {
  file: File
  url: string
  type: 'image' | 'video'
}
export interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export interface SearchResultsProps {
  query: string
  onClose: () => void
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
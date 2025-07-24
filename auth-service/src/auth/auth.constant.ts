export const OTP_PURPOSE = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];

export const USER_STATUS = {
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  BANNED: 'BANNED', // Bị cấm (không thể đăng nhập hoặc thực hiện hành động)
  INACTIVE: 'INACTIVE', // Không hoạt động (có thể đăng nhập nhưng không thể thực hiện hành động)
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const OTP_STATUS = {
  CREATED: 1,
  VERIFIED: 2,
} as const;

export type OtpStatus = (typeof OTP_STATUS)[keyof typeof OTP_STATUS];

export const OTP_PURPOSE = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];

export const USER_STATUS = {
  VERIFIED: 'VERIFIED',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

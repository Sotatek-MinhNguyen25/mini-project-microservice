'use client';
import { useParams } from 'next/navigation';
import OtpVerificationStep from '@/components/auth/resetPassword/otpInputStep';
import { useVerifyOtp } from '@/hooks/useVerifyOtp';

export default function VerifyRegister() {
  const { email = '' } = useParams<{ email: string }>();
  const { otp, setOtp, errors, otpRefs, handleOtpSubmit, handleResendOtp } =
    useVerifyOtp(email);

  return (
    <div className="flex align-center justify-center h-screen py-60">
      <OtpVerificationStep
        otp={otp}
        setOtp={setOtp}
        email={email}
        errors={errors}
        countdown={0}
        handleResendOtp={handleResendOtp}
        handleOtpSubmit={handleOtpSubmit}
        otpRefs={otpRefs}
      />
    </div>
  );
}

'use client';
import { useParams } from 'next/navigation';
import OtpVerificationStep from '@/components/auth/resetPassword/otpInputStep';
import { useRegister, useVerifyOtp } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { RegisterData } from '@/types/auth';
import { useToast } from '@/hooks/useToast';

export default function VerifyRegister() {
  const { email = '' } = useParams<{ email: string }>();
  const [registerData, setRegisterData] = useState<RegisterData>();
  const { otp, setOtp, errors, otpRefs, handleResendOtp } = useVerifyOtp(email);
  const { mutate: register } = useRegister();
  const { toast } = useToast();

  useEffect(() => {
    const data = sessionStorage.getItem('registerForm');
    if (data) {
      setRegisterData(JSON.parse(data));
    }
  }, []);

  const handleOtpSubmit = async () => {
    if (otp.length !== 6 || !registerData) {
      toast({
        title: 'Error',
        description: 'Invalid OTP or missing registration data.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const registerDataWithOtp = {
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        otp: otp.join(''),
      };
      await register(registerDataWithOtp);
      sessionStorage.removeItem('registerForm');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Registration failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

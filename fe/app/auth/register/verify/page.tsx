'use client';
import { useParams } from 'next/navigation';
import OtpVerificationStep from '@/components/auth/resetPassword/otpInputStep';
import { useRegister, useVerifyOtp } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { RegisterData } from '@/types/auth';

export default function VerifyRegister() {
  const { email = '' } = useParams<{ email: string }>();
  const [registerData, setRegisterData] = useState<RegisterData>();
  const { otp, setOtp, errors, otpRefs, handleResendOtp } = useVerifyOtp(email);
  const { mutate: register } = useRegister();

  useEffect(() => {
    const data = sessionStorage.getItem('registerForm');
    console.log('Register data from sessionStorage:', data);
    if (data) {
      setRegisterData(JSON.parse(data));
    }
  }, []);

  const handleOtpSubmit = async () => {
    console.log('OTP submitted:', otp.join(''));
    console.log('Register data:', registerData);
    if (otp.length !== 6 || !registerData) {
      console.log('Invalid OTP or missing registration data');
      return;
    }

    try {
      const registerDataWithOtp ={
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        otp: otp.join(''),
      }
      console.log('Registering with data:', registerDataWithOtp);
      await register(registerDataWithOtp);
      sessionStorage.removeItem('registerForm');
    } catch (error) {
      console.error('Registration failed:', error);
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

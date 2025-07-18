import { useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import authService from '@/service/auth.service';
import { toast } from './useToast';
import { useRouter } from 'next/navigation';

export function useVerifyOtp(email: string) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const router = useRouter();

  const verifyMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOTP(email, otp),
    onSuccess: (data) => {
      console.log('OTP verification successful:', data);
      setOtp(Array(6).fill(''));
      setErrors({});
      toast({
        title: 'Success',
        description: 'Please login to your account.',
      });
      router.push(`/auth/login`);
    },
    onError: (error: any) => {
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP' });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      const otpString = newOtp.join('');
      // Mock logic for testing
      if (otpString === '123456' || email === 'mock@email.com') {
        setOtp(Array(6).fill(''));
        setErrors({});
        toast({
          title: 'Success',
          description: 'Please login to your account.',
        });
        router.push(`/auth/login`);
        return;
      }
      verifyMutation.mutate({ email, otp: otpString });
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    if (otp.every((digit) => digit !== '')) {
      const otpString = otp.join('');
      // Mock logic for testing
      if (otpString === '123456' || email === 'mock@email.com') {
        setOtp(Array(6).fill(''));
        setErrors({});
        toast({
          title: 'Success',
          description: 'Please login to your account.',
        });
        router.push(`/auth/login`);
        return;
      }
      verifyMutation.mutate({ email, otp: otpString });
    }
  };

  const handleResendOtp = () => {
    console.log('Resend OTP requested');
  };

  return {
    otp,
    setOtp,
    errors,
    setErrors,
    verifyOtp: verifyMutation.mutate,
    isLoading: verifyMutation.status === 'pending',
    otpRefs,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpSubmit,
    handleResendOtp,
  };
}
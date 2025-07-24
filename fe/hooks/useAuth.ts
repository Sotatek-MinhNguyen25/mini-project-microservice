'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginCredentials } from '@/types';
import { jwtDecode } from 'jwt-decode';
import authService from '@/service/auth.service';
import {
  ApiResponse,
  DecodedToken,
  RegisterData,
  RegisterResponse,
  ResetPasswordData,
  ResetPasswordResponse,
} from '@/types/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast, useToast } from './useToast';

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = () => localStorage.getItem('accessToken');
    setAccessToken(getToken());

    const handleStorageChange = () => {
      setAccessToken(getToken());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return accessToken;
}

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation<ApiResponse, Error, LoginCredentials>({
    mutationFn: async ({ email, password }) => {
      return await authService.login(email, password);
    },
    onSuccess: async (response) => {
      if (response.statusCode === 200 || response.statusCode === 201) {
        const { accessToken, refreshToken } = response.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        try {
          const decodedUser: DecodedToken = jwtDecode(accessToken);
          console.log('Decoded user:', decodedUser.roles[0]);

          const role = decodedUser.roles?.[0]?.trim();
          console.log('User role:', role);
          localStorage.setItem('userRole', role);

          // // navigate to the appropriate dashboard based on user role
          if (role === 'ADMIN') {
            console.log('User is an admin, redirecting to admin dashboard');
            router.push('/admin');
          } else if (role === 'USER') {
            const userProfile = await authService.me();

            if (
              !userProfile ||
              !userProfile.roles ||
              userProfile.roles.length === 0
            ) {
              throw new Error(
                'User profile is incomplete or roles are missing',
              );
            }

            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            router.push('/');
          }
        } catch (error) {
          console.error('Failed to decode JWT:', error);
          toast({
            title: 'Warning',
            description:
              'Unable to decode access token. Proceeding with login.',
            variant: 'default',
          });
        }

        // router.push('/');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description:
          error.message || 'An error occurred. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authService.sendVerificationEmail(email);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      toast({
        title: 'Success!',
        description:
          'Verification email sent successfully. Please check your inbox.',
      });
      router.push(
        `/auth/register/verify?email=${encodeURIComponent(data.email)}`,
      );
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error.message ||
          'Failed to send verification email. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> => {
      const response = await authService.register(data);
      console.log('Register response:', response);
      return response;
    },
    onSuccess: (data: RegisterResponse) => {
      console.log('Registration successful:', data);
      queryClient.invalidateQueries({ queryKey: ['user'] });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      toast({
        title: 'Success!',
        description:
          'Your account has been created successfully! Please login to your account.',
      });

      router.push('/auth/login');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await authService.resetPassword(data.email);
      return response as ResetPasswordResponse;
    },
    onSuccess: (data) => {
      toast({
        title: 'Success! ',
        description:
          data.message || 'A password reset link has been sent to your email.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error.message ||
          'Failed to send password reset link. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyOtpResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyResetPasswordOTP(email, otp),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Please login to your account.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid OTP',
        variant: 'destructive',
      });
    },
  });
}

export function useSendResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ email, otp, password }: { email: string; otp: string; password: string }) =>
      authService.sendNewPassword(email, password, otp),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Please login to your account.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid password',
        variant: 'destructive',
      });
    },
  });
}

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

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    await authService.logout();
    router.push('/auth/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  }, [router, toast]);

  return { logout };
}

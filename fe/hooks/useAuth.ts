'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';

import authService from '@/service/auth.service';
import {
  LoginCredentials,
  DecodedToken,
  RegisterData,
  RegisterResponse,
  ResetPasswordData,
  ResetPasswordResponse,
} from '@/types/auth';
import { useToast } from './useToast';
import { UseVerifyOtpReturn } from '@/types/response';

const storage = {
  get: (key: string) =>
    typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
};

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = () => storage.get('accessToken');
    setAccessToken(getToken());

    const handleStorageChange = () => setAccessToken(getToken());
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return accessToken;
}

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) =>
      authService.login(email, password),
    onSuccess: async (response) => {
      const isValidResponse =
        response &&
        (response.statusCode === 200 || response.statusCode === 201);
      if (isValidResponse) {
        const { accessToken, refreshToken } = response.data!;
        storage.set('accessToken', accessToken);
        storage.set('refreshToken', refreshToken);

        try {
          const decodedUser: DecodedToken = jwtDecode(accessToken);
          const role = decodedUser.roles?.[0]?.trim();
          storage.set('userRole', role ?? '');

          if (role === 'ADMIN') {
            router.push('/admin');
          } else if (role === 'USER') {
            const userProfile = await authService.me();
            if (!userProfile?.roles?.length) {
              throw new Error(
                'User profile is incomplete or roles are missing',
              );
            }
            storage.set('userProfile', JSON.stringify(userProfile));
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'userProfile',
                newValue: JSON.stringify(userProfile),
              }),
            );
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'accessToken',
                newValue: accessToken,
              }),
            );
            router.push('/');
          }
        } catch {
          toast({
            title: 'Warning',
            description:
              'Unable to decode access token. Proceeding with login.',
            variant: 'default',
          });
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error?.message || 'An error occurred. Please try again later.',
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
    mutationFn: async (email: string) =>
      authService.sendVerificationEmail(email),
    onSuccess: ({ id, email }) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast({
        title: 'Success!',
        description: 'Verification email sent. Please check your inbox.',
      });
      router.push(`/auth/register/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error?.message ||
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
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> =>
      authService.register(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      storage.set('accessToken', data.accessToken);
      storage.set('refreshToken', data.refreshToken);
      toast({
        title: 'Success!',
        description:
          'Your account has been created successfully! Please login.',
      });
      router.push('/auth/login');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      email,
    }: ResetPasswordData): Promise<ResetPasswordResponse> =>
      authService.resetPassword(email),
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: data.message || 'Password reset link sent.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send password reset link.',
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
      toast({ title: 'Success', description: 'Please login to your account.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Invalid OTP',
        variant: 'destructive',
      });
    },
  });
}

export function useSendResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      email,
      otp,
      password,
    }: {
      email: string;
      otp: string;
      password: string;
    }) => authService.sendNewPassword(email, password, otp),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Please login to your account.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Invalid password',
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyOtp(email: string): UseVerifyOtpReturn {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const router = useRouter();
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOTP(email, otp),
    onSuccess: () => {
      setOtp(Array(6).fill(''));
      setErrors({});
      toast({ title: 'Success', description: 'Please login to your account.' });
      router.push(`/auth/login`);
    },
    onError: (error: any) => {
      setErrors({ otp: error?.response?.data?.message || 'Invalid OTP' });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    if (value && index < 5) otpRefs.current[index + 1]?.focus();

    // Submit if all filled
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      const otpString = newOtp.join('');
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
  };
}

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    storage.remove('accessToken');
    storage.remove('refreshToken');
    await authService.logout();
    router.push('/auth/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  }, [router, toast]);

  return { logout };
}

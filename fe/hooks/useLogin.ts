'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { post } from '../app/lib/axiosClient';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  profile?: Record<string, any>;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await post<LoginCredentials>('/api/login', credentials);
        
        if (response.status === 200 && response.data) {
          const { accessToken, profile } = response.data as LoginResponse;
          
          // Lưu token và profile vào localStorage
          localStorage.setItem('accessToken', accessToken);
          if (profile) {
            localStorage.setItem('profile', JSON.stringify(profile));
          }

          // Chuyển hướng về trang trước đó hoặc dashboard
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
        } else {
          setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
      } catch (err) {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    },
    [router, searchParams]
  );

  return { login, isLoading, error };
};
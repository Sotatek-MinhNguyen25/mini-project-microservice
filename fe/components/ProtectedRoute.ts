'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const decodedUser: DecodedToken = jwtDecode(token);
        const role = decodedUser.roles?.[0]?.trim().toUpperCase();

        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'USER') {
          router.push('/');
        } else {
          router.push('/auth/login');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;

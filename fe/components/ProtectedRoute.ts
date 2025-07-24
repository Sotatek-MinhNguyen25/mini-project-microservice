'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

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
        const role = decodedUser.roles?.[0]?.trim();

        // Define allowed routes per role
        const roleRoutes: Record<string, string[]> = {
          ADMIN: ['/admin', '/admin/dashboard', '/admin/settings'],
          USER: ['/', '/user/profile', '/user/orders'],
        };

        const allowedRoutes = roleRoutes[role] || [];

        if (!allowedRoutes.includes(pathname)) {
          // If not allowed, redirect to default route per role
          const defaultRoute = role === 'ADMIN' ? '/admin' : '/';
          router.push(defaultRoute);
          return;
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
  }, [router, pathname]);

  return isLoading ? null : isAuthenticated ? children : null;
};

export default ProtectedRoute;

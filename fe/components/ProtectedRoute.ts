// components/ProtectedRoute.jsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        console.log('Auth token found:', token);
        setIsAuthenticated(true);
        // const response = await fetch('https://your-backend-api/verify-token', {
        //   headers: { Authorization: `Bearer ${token}` },
        //   credentials: 'include', // Include cookies if using them
        // });

        // if (response.ok) {
        //   setIsAuthenticated(true);
        // } else {
        //   localStorage.removeItem('auth_token');
        //   router.push('/login');
        // }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
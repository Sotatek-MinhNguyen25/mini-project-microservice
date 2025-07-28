'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/auth';
import { useLogout } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { logout } = useLogout();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userLC = localStorage.getItem('userProfile');

    if (accessToken && userLC) {
      try {
        setUser(JSON.parse(userLC));
        setToken(accessToken);
      } catch (error) {
        console.error('Error parsing user data:', error);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userProfile');
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        const newToken = e.newValue;
        setToken(newToken);

        if (!newToken) {
          setUser(null);
        }
      }

      if (e.key === 'userProfile') {
        const newUser = e.newValue;
        try {
          setUser(newUser ? JSON.parse(newUser) : null);
        } catch (error) {
          console.error('Error parsing user from storage change:', error);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    logout,
    isLoading,
    isAuthenticated: Boolean(user && token),
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

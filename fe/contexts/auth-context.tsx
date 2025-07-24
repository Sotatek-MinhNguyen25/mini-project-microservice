'use client';

import type React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useLogout();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userLC = localStorage.getItem('userProfile');

    if (token && userLC) {
      setUser(JSON.parse(userLC));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

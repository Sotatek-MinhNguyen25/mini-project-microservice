'use client';

import { useEffect, useState } from 'react';

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

'use client';

import { AuthPage } from '@/components/auth/authPage';
import { Toaster } from '@/components/ui/toaster';

export default function Login() {
  return (
    <div>
      <AuthPage />
      <Toaster />
    </div>
  );
}

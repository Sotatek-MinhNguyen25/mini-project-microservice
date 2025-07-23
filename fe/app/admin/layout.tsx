'use client';

import type React from 'react';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex `}>
      <AdminSidebar />
      <main className={`flex-1 min-h-screen `}>{children}</main>
    </div>
  );
}

import { useAccessToken } from '@/hooks/useGetAccessToken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { use } from 'react';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = useAccessToken();
  
  // Danh sách các route cần bảo vệ
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  
  // Danh sách các route công khai
  const publicRoutes = ['/login', '/register', '/'];

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Nếu đã đăng nhập mà cố truy cập login/register
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const AUTH_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path);
}

function isAuthApiPath(pathname: string) {
  return AUTH_API_PATHS.some((path) => pathname.startsWith(path));
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\\.(.*)$/)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow authentication API routes without middleware
  if (pathname.startsWith('/api')) {
    if (isAuthApiPath(pathname)) {
      return NextResponse.next();
    }

    // Protect other API routes - require auth cookie
    const adminAuth = request.cookies.get('adminAuth')?.value;
    if (!adminAuth || adminAuth !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  const adminAuth = request.cookies.get('adminAuth')?.value;
  const isAuthenticated = adminAuth === 'true';

  // Redirect authenticated users away from login page
  if (isPublicPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login (except public paths)
  if (!isAuthenticated && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)).*)',
  ],
};

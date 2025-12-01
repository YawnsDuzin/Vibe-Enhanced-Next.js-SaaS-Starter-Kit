import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/api/billing', '/api/user'];

// Admin-only routes
const adminRoutes = ['/admin'];

// Public routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register', '/forgot-password'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Allow public API routes
  if (
    isApiRoute &&
    (nextUrl.pathname.startsWith('/api/auth') ||
      nextUrl.pathname.startsWith('/api/webhooks'))
  ) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Protect API routes
  if (isApiRoute && isProtectedRoute && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Check admin routes
  if (isAdminRoute && isLoggedIn) {
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

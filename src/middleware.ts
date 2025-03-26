import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // List of public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // If no token and trying to access a protected route, redirect to login
  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If token exists and user is trying to access public paths
  if (token && isPublicPath) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'ADMIN') {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL('/user', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle role-based access
  if (token && userRole) {
    // If admin trying to access user page
    if (userRole === 'ADMIN' && pathname === '/user') {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    }
    
    // If user trying to access admin page
    if (userRole !== 'ADMIN' && pathname === '/admin') {
      const url = new URL('/user', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Only run middleware on specified paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 
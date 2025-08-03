import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/auth/signin';
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
  const isDevPage = request.nextUrl.pathname.startsWith('/dev');

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.next();
  }

  // Allow anonymous access to onboarding pages
  if (isOnboardingPage) {
    return NextResponse.next();
  }

  // Allow anonymous access to dev pages (monitoring, testing, etc.)
  if (isDevPage) {
    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { getAdminIdFromCookies } from './lib/auth';

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const id = await getAdminIdFromCookies();
      if (!id) return NextResponse.redirect(new URL('/login', request.url));

      return NextResponse.next();return NextResponse.redirect(new URL('/login', request.url));
    }
    
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
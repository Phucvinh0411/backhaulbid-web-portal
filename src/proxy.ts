import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getInternalGatewayUrl } from '@/config/serverConfig';

type AccessClaims = { sub: string; role: string; exp: number };

const ACCESS_COOKIE_MAX_AGE = 15 * 60; // same lifetime as the backend access token

function decode(token: string | undefined): AccessClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<AccessClaims>(token);
  } catch {
    return null;
  }
}

/** True when the token is missing, malformed, or expires within the next 30 seconds. */
function needsRefresh(claims: AccessClaims | null): boolean {
  return !claims || !claims.exp || claims.exp * 1000 <= Date.now() + 30_000;
}

/**
 * The access cookie lives 15 minutes, the refresh cookie 7 days. A page navigation after the access
 * cookie expired used to land on /login even though the session was still valid; renew it here first.
 */
async function refreshAccessToken(request: NextRequest): Promise<string | null> {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${getInternalGatewayUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken || data.data?.accessToken || null;
  } catch {
    return null;
  }
}

function homeFor(role: string | undefined, request: NextRequest) {
  if (role === 'CARRIER') return new URL('/carrier', request.url);
  if (role === 'ADMIN') return new URL('/admin', request.url);
  if (role === 'SHIPPER') return new URL('/shipper', request.url);
  return new URL('/', request.url);
}

function toLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  let token = request.cookies.get('accessToken')?.value;
  let claims = decode(token);
  let renewed: string | null = null;

  if (needsRefresh(claims)) {
    renewed = await refreshAccessToken(request);
    if (renewed) {
      token = renewed;
      claims = decode(renewed);
      // Let the page rendered for this request read the new token too.
      request.cookies.set('accessToken', renewed);
    } else {
      token = undefined;
      claims = null;
    }
  }

  const withRenewedCookie = (response: NextResponse) => {
    if (renewed) {
      response.cookies.set('accessToken', renewed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_COOKIE_MAX_AGE,
      });
    }
    return response;
  };

  // Kịch bản 1: Chưa đăng nhập (hoặc phiên đã hết hạn hẳn)
  if (!token || !claims) {
    if (isLoginPage) return NextResponse.next();
    return request.cookies.get('refreshToken') ? toLogin(request) : NextResponse.redirect(new URL('/login', request.url));
  }

  // Kịch bản 2: Đã đăng nhập nhưng cố vào /login
  if (isLoginPage) {
    return withRenewedCookie(NextResponse.redirect(homeFor(claims.role, request)));
  }

  // Kịch bản 3: Đã đăng nhập, phân quyền truy cập
  const path = request.nextUrl.pathname;
  if (path.startsWith('/carrier') && claims.role !== 'CARRIER') {
    return withRenewedCookie(NextResponse.redirect(new URL('/403', request.url)));
  }
  if (path.startsWith('/admin') && claims.role !== 'ADMIN') {
    return withRenewedCookie(NextResponse.redirect(new URL('/403', request.url)));
  }
  if (path.startsWith('/shipper') && claims.role !== 'SHIPPER') {
    return withRenewedCookie(NextResponse.redirect(new URL('/403', request.url)));
  }

  return withRenewedCookie(NextResponse.next({ request: { headers: request.headers } }));
}

export const config = {
  matcher: [
    '/carrier/:path*',
    '/admin/:path*',
    '/shipper/:path*',
    '/login'
  ],
};

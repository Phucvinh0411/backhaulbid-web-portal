import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Kịch bản 1: Chưa đăng nhập
  if (!token) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Kịch bản 2: Đã đăng nhập nhưng cố vào /login
  if (token && isLoginPage) {
     // Đoán role điều hướng về đúng màn hình
     try {
       const decoded: any = jwtDecode(token);
       if (decoded.role === 'CARRIER') return NextResponse.redirect(new URL('/carrier', request.url));
       if (decoded.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
       if (decoded.role === 'SHIPPER') return NextResponse.redirect(new URL('/shipper', request.url));
       return NextResponse.redirect(new URL('/', request.url));
     } catch(e) {
       return NextResponse.redirect(new URL('/', request.url));
     }
  }

  // Kịch bản 3: Đã đăng nhập, phân quyền truy cập
  try {
    const decoded: { sub: string; role: string; exp: number } = jwtDecode(token);
    
    // Bảo vệ Route Carrier
    if (request.nextUrl.pathname.startsWith('/carrier') && decoded.role !== 'CARRIER') {
      return NextResponse.redirect(new URL('/403', request.url)); 
    }

    // Bảo vệ Route Admin
    if (request.nextUrl.pathname.startsWith('/admin') && decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url)); 
    }
    
    // Bảo vệ Route Shipper
    if (request.nextUrl.pathname.startsWith('/shipper') && decoded.role !== 'SHIPPER') {
      return NextResponse.redirect(new URL('/403', request.url)); 
    }

  } catch (error) {
    // Token hỏng định dạng
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/carrier/:path*', 
    '/admin/:path*', 
    '/shipper/:path*', 
    '/login'
  ],
};

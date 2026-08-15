import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ưu tiên dùng INTERNAL_GATEWAY_URL (khi chạy trong Docker) để server-to-server call, nếu không có thì fallback về NEXT_PUBLIC
    const gatewayUrl = process.env.INTERNAL_GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    
    // Proxy call tới API Gateway Backend
    const res = await fetch(`${gatewayUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
        return NextResponse.json({ success: false, message: 'Sai thông tin đăng nhập' }, { status: 401 });
    }

    const data = await res.json();
    // Payload trả về từ server có cấu trúc: { data: { accessToken: "...", refreshToken: "..." } } hoặc tương tự
    // Giả sử lấy trực tiếp data.accessToken và data.refreshToken
    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;
    
    if (!accessToken || !refreshToken) {
         return NextResponse.json({ success: false, message: 'Đăng nhập lỗi do không tìm thấy token' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const useSecureCookies =
      process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
    
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: useSecureCookies,
      // Allow top-level return navigation from the payment provider to keep the session.
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 // 15 phút
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: useSecureCookies,
      // Keep the refresh session available when the browser returns from an external provider.
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 ngày
    });

    return NextResponse.json({ success: true, message: 'Đăng nhập thành công', data: data.data || data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi kết nối tới server' }, { status: 500 });
  }
}

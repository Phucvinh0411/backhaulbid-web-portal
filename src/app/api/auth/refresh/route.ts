import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = cookies();
    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    if (!currentRefreshToken) {
      return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
    }

    // Ưu tiên dùng INTERNAL_GATEWAY_URL (khi chạy trong Docker) để server-to-server call
    const gatewayUrl = process.env.INTERNAL_GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    
    // Đẩy refresh token lên cho backend xử lý
    const res = await fetch(`${gatewayUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!res.ok) {
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
        return NextResponse.json({ success: false, message: 'Refresh token hết hạn' }, { status: 401 });
    }

    const data = await res.json();
    const newAccessToken = data.accessToken || data.data?.accessToken;
    
    const isProd = process.env.NODE_ENV === 'production';
    
    if (newAccessToken) {
        cookieStore.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60 // 15 phút
        });
    }

    return NextResponse.json({ success: true, message: 'Refresh token thành công' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi' }, { status: 500 });
  }
}

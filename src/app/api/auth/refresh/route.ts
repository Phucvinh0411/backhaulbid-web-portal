import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getInternalGatewayUrl } from '@/config/serverConfig';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    if (!currentRefreshToken) {
      return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
    }

    // Ưu tiên dùng INTERNAL_GATEWAY_URL (khi chạy trong Docker) để server-to-server call
    const gatewayUrl = getInternalGatewayUrl();
    
    // Đẩy refresh token lên cho backend xử lý
    const res = await fetch(`${gatewayUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(currentRefreshToken)}`,
      },
    });

    if (!res.ok) {
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
        return NextResponse.json({ success: false, message: 'Refresh token hết hạn' }, { status: 401 });
    }

    const data = await res.json();
    const newAccessToken = data.accessToken || data.data?.accessToken;
    
    const useSecureCookies =
      process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
    
    if (newAccessToken) {
        cookieStore.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: useSecureCookies,
          // Allow top-level return navigation from the payment provider to keep the session.
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60 // 15 phút
        });
    }

    return NextResponse.json({ success: true, message: 'Refresh token thành công' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi' }, { status: 500 });
  }
}

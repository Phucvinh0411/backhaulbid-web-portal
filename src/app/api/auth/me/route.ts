import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getInternalGatewayUrl } from '@/config/serverConfig';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const gatewayUrl = getInternalGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Không lấy được thông tin từ server' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi server khi lấy thông tin người dùng' }, { status: 500 });
  }
}

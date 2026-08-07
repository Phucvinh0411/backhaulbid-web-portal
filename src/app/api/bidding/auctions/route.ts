import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const gatewayUrl = process.env.INTERNAL_GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Vui lòng đăng nhập lại' }, { status: 401 });
    }

    const res = await fetch(`${gatewayUrl}/api/v1/bidding/auctions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return NextResponse.json({ success: false, message: data?.message || 'Lỗi khi tạo phiên đấu giá từ hệ thống' }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: 'Tạo phiên đấu giá thành công', data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi kết nối tới server (Gateway)' }, { status: 500 });
  }
}

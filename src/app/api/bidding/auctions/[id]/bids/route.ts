import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const gatewayUrl = process.env.INTERNAL_GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Vui lòng đăng nhập lại' }, { status: 401 });
    }

    const res = await fetch(`${gatewayUrl}/api/v1/bidding/auctions/${id}/bids${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      cache: 'no-store'
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return NextResponse.json({ success: false, message: data?.message || 'Lỗi khi tải danh sách bids' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi kết nối tới server (Gateway)' }, { status: 500 });
  }
}

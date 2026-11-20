import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getInternalGatewayUrl } from '@/config/serverConfig';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const gatewayUrl = getInternalGatewayUrl();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Vui lòng đăng nhập lại' }, { status: 401 });
    }

    const payload = body?.reason ? { reason: body.reason } : {};
    const res = await fetch(`${gatewayUrl}/api/v1/bidding/auctions/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.error?.message || data?.message || 'Lỗi khi hủy phiên đấu giá' },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: 'Đã có lỗi kết nối tới server (Gateway)' }, { status: 500 });
  }
}

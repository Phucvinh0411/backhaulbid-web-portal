import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getInternalGatewayUrl } from '@/config/serverConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const gatewayUrl = getInternalGatewayUrl();
    
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const gatewayUrl = getInternalGatewayUrl();
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Vui lòng đăng nhập lại' }, { status: 401 });
    }

    const res = await fetch(`${gatewayUrl}/api/v1/bidding/auctions${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return NextResponse.json({ success: false, message: data?.message || 'Lỗi khi tải danh sách đấu giá' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã có lỗi kết nối tới server (Gateway)' }, { status: 500 });
  }
}

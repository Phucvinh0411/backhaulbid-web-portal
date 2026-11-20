import { NextResponse } from 'next/server';
import { getInternalGatewayUrl } from '@/config/serverConfig';
import { extractAuthTokens, setAuthSessionCookies } from '../_shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gatewayUrl = getInternalGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Đăng nhập Google thất bại' },
        { status: res.status },
      );
    }

    if (data?.needsOnboarding) {
      return NextResponse.json({
        success: true,
        needsOnboarding: true,
        onboardingToken: data.onboardingToken,
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      });
    }

    const authPayload = data?.auth || data?.data || data;
    const { accessToken, refreshToken } = extractAuthTokens(authPayload);
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Đăng nhập Google lỗi do không tìm thấy token' },
        { status: 500 },
      );
    }

    await setAuthSessionCookies(accessToken, refreshToken);
    return NextResponse.json({
      success: true,
      needsOnboarding: false,
      message: 'Đăng nhập thành công',
      data: authPayload,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi kết nối tới máy chủ' },
      { status: 500 },
    );
  }
}

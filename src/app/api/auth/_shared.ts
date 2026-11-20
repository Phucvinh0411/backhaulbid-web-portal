import { cookies } from 'next/headers';

export async function setAuthSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const useSecureCookies =
    process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function extractAuthTokens(payload: Record<string, unknown> | null | undefined) {
  const nested = payload?.data as Record<string, unknown> | undefined;
  const accessToken = (payload?.accessToken ?? nested?.accessToken) as string | undefined;
  const refreshToken = (payload?.refreshToken ?? nested?.refreshToken) as string | undefined;
  return { accessToken, refreshToken };
}

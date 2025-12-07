import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const COOKIE_NAME = 'token';

// Cookie 기본 옵션
const baseCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

/**
 * 토큰 설정용 Cookie 옵션
 */
export function getSetCookieOptions(maxAgeSeconds: number): ResponseCookie {
  return {
    ...baseCookieOptions,
    name: COOKIE_NAME,
    value: '', // 실제 값은 별도 설정
    maxAge: maxAgeSeconds,
  } as ResponseCookie;
}

/**
 * 토큰 삭제용 Cookie 옵션
 */
export function getClearCookieOptions(): ResponseCookie {
  return {
    ...baseCookieOptions,
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
  } as ResponseCookie;
}




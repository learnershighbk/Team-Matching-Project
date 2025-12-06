import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import type { AppEnv } from '@/backend/hono/context';
import { contextKeys } from '@/backend/hono/context';
import { verifyToken, type TokenPayload, COOKIE_NAME } from '@/features/auth/backend/jwt';
import { failure, respond } from '@/backend/http/response';

type Role = 'admin' | 'instructor' | 'student';

/**
 * 인증 미들웨어
 * 
 * 허용된 역할을 가진 사용자만 접근 가능하도록 보호합니다.
 * 토큰을 검증하고 컨텍스트에 인증 정보를 설정합니다.
 */
export function requireAuth(allowedRoles: Role[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = getCookie(c, COOKIE_NAME);

    if (!token) {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    // 역할 검증
    if (!allowedRoles.includes(payload.role)) {
      return respond(c, failure(403, 'AUTH_003', '권한이 없습니다'));
    }

    // 컨텍스트에 인증 정보 설정
    c.set(contextKeys.auth, payload);

    await next();
  });
}


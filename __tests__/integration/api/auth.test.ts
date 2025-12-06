/**
 * 인증 API 통합 테스트
 *
 * 실제 Hono 앱을 사용하여 API 엔드포인트 테스트
 * 참고: 일부 테스트는 실제 환경변수 설정이 필요합니다.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createHonoApp } from '@/backend/hono/app';
import type { Hono } from 'hono';

describe('Auth API', () => {
  let app: Hono;

  beforeAll(() => {
    app = createHonoApp();
  });

  describe('POST /api/admin/login', () => {
    // 환경변수가 올바르게 설정된 경우에만 통과
    it.skip('올바른 자격증명으로 로그인 성공 (실제 환경변수 필요)', async () => {
      // 환경변수에서 Admin 자격증명 가져오기
      const adminEmail = process.env.ADMIN_EMAIL || 'bklee@kdischool.ac.kr';
      const adminPassword = process.env.ADMIN_PASSWORD || '1217';

      const req = new Request('http://localhost/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('role', 'admin');
      expect(data).toHaveProperty('email', adminEmail);
    });

    it('잘못된 자격증명으로 로그인 실패', async () => {
      const req = new Request('http://localhost/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpassword',
        }),
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code', 'AUTH_003');
    });
  });

  describe('GET /api/auth/me', () => {
    it('토큰 없이 조회 시 적절한 응답 반환', async () => {
      const req = new Request('http://localhost/api/auth/me', {
        method: 'GET',
      });

      const res = await app.request(req);

      // 토큰이 없으면 200(null), 401, 또는 404 반환 가능
      expect([200, 401, 404]).toContain(res.status);
    });
  });
});


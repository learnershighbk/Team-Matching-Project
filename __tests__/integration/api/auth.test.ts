/**
 * 인증 API 통합 테스트
 * 
 * 실제 Hono 앱을 사용하여 API 엔드포인트 테스트
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
    it('올바른 자격증명으로 로그인 성공', async () => {
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
    it('토큰 없이 조회 시 null 반환', async () => {
      const req = new Request('http://localhost/api/auth/me', {
        method: 'GET',
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toBeNull();
    });
  });
});


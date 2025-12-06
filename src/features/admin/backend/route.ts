import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';

/**
 * Admin Feature 라우트
 * 
 * - GET /api/admin/instructors: 교수자 목록 조회
 * - POST /api/admin/instructors: 교수자 생성
 * - PUT /api/admin/instructors/:id: 교수자 수정
 * - DELETE /api/admin/instructors/:id: 교수자 삭제
 * - PUT /api/admin/students/:id/reset-pin: 학생 PIN 리셋
 * - GET /api/admin/courses: 코스 목록 조회
 * - PUT /api/admin/courses/:id/deadline: 코스 마감일 수정
 */
export const registerAdminRoutes = (app: Hono<AppEnv>) => {
  const admin = new Hono<AppEnv>();

  // 모든 Admin 라우트는 인증 필요
  admin.use('*', requireAuth(['admin']));

  // TODO: 교수자 목록 조회
  // admin.get('/instructors', async (c) => { ... });

  // TODO: 교수자 생성
  // admin.post('/instructors', async (c) => { ... });

  // TODO: 교수자 수정
  // admin.put('/instructors/:id', async (c) => { ... });

  // TODO: 교수자 삭제
  // admin.delete('/instructors/:id', async (c) => { ... });

  // TODO: 학생 PIN 리셋
  // admin.put('/students/:id/reset-pin', async (c) => { ... });

  // TODO: 코스 목록 조회
  // admin.get('/courses', async (c) => { ... });

  // TODO: 코스 마감일 수정
  // admin.put('/courses/:id/deadline', async (c) => { ... });

  app.route('/api/admin', admin);
};


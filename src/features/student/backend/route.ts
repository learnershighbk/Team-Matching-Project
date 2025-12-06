import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';

/**
 * Student Feature 라우트
 * 
 * - GET /api/student/profile: 프로필 조회
 * - PUT /api/student/profile: 프로필 수정
 * - GET /api/student/team: 팀 결과 조회
 */
export const registerStudentRoutes = (app: Hono<AppEnv>) => {
  const student = new Hono<AppEnv>();

  // 모든 Student 라우트는 인증 필요
  student.use('*', requireAuth(['student']));

  // TODO: 프로필 조회
  // student.get('/profile', async (c) => { ... });

  // TODO: 프로필 수정
  // student.put('/profile', async (c) => { ... });

  // TODO: 팀 결과 조회
  // student.get('/team', async (c) => { ... });

  app.route('/api/student', student);
};


import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';

/**
 * Instructor Feature 라우트
 * 
 * - GET /api/instructor/courses: 내 코스 목록 조회
 * - POST /api/instructor/courses: 코스 생성
 * - GET /api/instructor/courses/:id: 코스 상세 조회
 * - PUT /api/instructor/courses/:id: 코스 수정
 * - DELETE /api/instructor/courses/:id: 코스 삭제
 * - GET /api/instructor/courses/:id/students: 학생 현황 조회
 * - POST /api/instructor/courses/:id/match: 매칭 실행 (미리보기)
 * - POST /api/instructor/courses/:id/confirm: 매칭 확정
 * - GET /api/instructor/courses/:id/teams: 팀 결과 조회
 */
export const registerInstructorRoutes = (app: Hono<AppEnv>) => {
  const instructor = new Hono<AppEnv>();

  // 모든 Instructor 라우트는 인증 필요
  instructor.use('*', requireAuth(['instructor']));

  // TODO: 코스 목록 조회
  // instructor.get('/courses', async (c) => { ... });

  // TODO: 코스 생성
  // instructor.post('/courses', async (c) => { ... });

  // TODO: 코스 상세 조회
  // instructor.get('/courses/:id', async (c) => { ... });

  // TODO: 코스 수정
  // instructor.put('/courses/:id', async (c) => { ... });

  // TODO: 코스 삭제
  // instructor.delete('/courses/:id', async (c) => { ... });

  // TODO: 학생 현황 조회
  // instructor.get('/courses/:id/students', async (c) => { ... });

  // TODO: 매칭 실행 (미리보기)
  // instructor.post('/courses/:id/match', async (c) => { ... });

  // TODO: 매칭 확정
  // instructor.post('/courses/:id/confirm', async (c) => { ... });

  // TODO: 팀 결과 조회
  // instructor.get('/courses/:id/teams', async (c) => { ... });

  app.route('/api/instructor', instructor);
};


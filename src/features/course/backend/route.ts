import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';

/**
 * Course Feature 라우트 (공개 API)
 * 
 * - GET /api/course/:id/status: 코스 상태 조회 (공개)
 */
export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  // TODO: 코스 상태 조회 (공개 API, 인증 불필요)
  // app.get('/api/course/:id/status', async (c) => { ... });
};


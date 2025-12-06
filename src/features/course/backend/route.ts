import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase } from '@/backend/hono/context';
import { respond } from '@/backend/http/response';
import { zodErrorToResponse } from '@/lib/errors';
import { CourseIdParamsSchema } from './schema';
import { getCourseStatus } from './service';

/**
 * Course Feature 라우트 (공개 API)
 * 
 * - GET /api/course/:id/status: 코스 상태 조회 (공개)
 */
export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  // 코스 상태 조회 (공개 API, 인증 불필요)
  app.get('/api/course/:id/status', async (c) => {
    const courseId = c.req.param('id');
    const parsed = CourseIdParamsSchema.safeParse({ id: courseId });

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const result = await getCourseStatus(supabase, parsed.data.id);
    return respond(c, result);
  });
};


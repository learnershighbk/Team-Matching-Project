import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerAdminRoutes } from '@/features/admin/backend/route';
import { registerInstructorRoutes } from '@/features/instructor/backend/route';
import { registerStudentRoutes } from '@/features/student/backend/route';
import { registerCourseRoutes } from '@/features/course/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // Production 환경에서만 싱글턴 캐싱 (개발 환경에서는 HMR을 위해 매번 재생성)
  if (process.env.NODE_ENV === 'production' && singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  // 인증 라우트를 먼저 등록 (로그인 엔드포인트는 인증 불필요)
  // 이렇게 해야 /api/admin/login 등의 로그인 경로가 admin 서브라우터에 가로채이지 않음
  registerAuthRoutes(app);
  // Admin/Instructor/Student 라우트는 나중에 등록 (인증 필요)
  registerAdminRoutes(app);
  registerInstructorRoutes(app);
  registerStudentRoutes(app);
  registerCourseRoutes(app);

  // Production 환경에서만 싱글턴 저장
  if (process.env.NODE_ENV === 'production') {
    singletonApp = app;
  }

  return app;
};

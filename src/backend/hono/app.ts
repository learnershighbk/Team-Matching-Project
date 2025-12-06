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
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerAuthRoutes(app);
  registerAdminRoutes(app);
  registerInstructorRoutes(app);
  registerStudentRoutes(app);
  registerCourseRoutes(app);

  singletonApp = app;

  return app;
};

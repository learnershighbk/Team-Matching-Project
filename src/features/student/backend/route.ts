import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger, getAuth } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { zodErrorToResponse } from '@/lib/errors';
import { UpdateProfileSchema } from './schema';
import { getProfile, updateProfile, getTeam } from './service';
import { studentErrorCodes, type StudentServiceError } from './error';
import type { StudentPayload } from '@/features/auth/backend/jwt';

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

  // 프로필 조회
  student.get('/profile', async (c) => {
    const auth = getAuth(c) as StudentPayload | undefined;
    if (!auth || auth.role !== 'student') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const supabase = getSupabase(c);
    const result = await getProfile(supabase, auth.studentId);
    return respond(c, result);
  });

  // 프로필 수정
  student.put('/profile', async (c) => {
    const auth = getAuth(c) as StudentPayload | undefined;
    if (!auth || auth.role !== 'student') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const body = await c.req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateProfile(supabase, auth.studentId, parsed.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StudentServiceError, unknown>;
      if (errorResult.error.code === studentErrorCodes.fetchError) {
        logger.error('Failed to update profile', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 팀 결과 조회
  student.get('/team', async (c) => {
    const auth = getAuth(c) as StudentPayload | undefined;
    if (!auth || auth.role !== 'student') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const supabase = getSupabase(c);
    const result = await getTeam(supabase, auth.studentId);
    return respond(c, result);
  });

  app.route('/api/student', student);
};


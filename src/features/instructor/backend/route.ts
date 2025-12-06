import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger, getAuth } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { zodErrorToResponse } from '@/lib/errors';
import { CreateCourseSchema, UpdateCourseSchema, MatchCourseSchema, ConfirmTeamsSchema, type CreateCourseInput } from './schema';
import {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  lockCourse,
  runMatching,
  confirmMatching,
  getCourseTeams,
} from './service';
import { instructorErrorCodes, type InstructorServiceError } from './error';
import type { InstructorPayload } from '@/features/auth/backend/jwt';

/**
 * Instructor Feature 라우트
 * 
 * - GET /api/instructor/courses: 내 코스 목록 조회
 * - POST /api/instructor/courses: 코스 생성
 * - GET /api/instructor/courses/:id: 코스 상세 조회
 * - PUT /api/instructor/courses/:id: 코스 수정
 * - DELETE /api/instructor/courses/:id: 코스 삭제
 * - GET /api/instructor/courses/:id/students: 학생 현황 조회
 * - POST /api/instructor/courses/:id/lock: 코스 잠금
 * - POST /api/instructor/courses/:id/match: 매칭 실행 (미리보기)
 * - POST /api/instructor/courses/:id/confirm: 매칭 확정
 * - GET /api/instructor/courses/:id/teams: 팀 결과 조회
 */
export const registerInstructorRoutes = (app: Hono<AppEnv>) => {
  const instructor = new Hono<AppEnv>();

  // 모든 Instructor 라우트는 인증 필요
  instructor.use('*', requireAuth(['instructor']));

  // 코스 목록 조회
  instructor.get('/courses', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const supabase = getSupabase(c);
    const result = await getCourses(supabase, auth.instructorId);
    return respond(c, result);
  });

  // 코스 생성
  instructor.post('/courses', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const body = await c.req.json();
    const parsed = CreateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createCourse(supabase, auth.instructorId, parsed.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InstructorServiceError, unknown>;
      if (errorResult.error.code === instructorErrorCodes.fetchError) {
        logger.error('Failed to create course', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 코스 상세 조회
  instructor.get('/courses/:id', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const supabase = getSupabase(c);

    const result = await getCourseById(supabase, courseId, auth.instructorId);
    return respond(c, result);
  });

  // 코스 수정
  instructor.put('/courses/:id', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const body = await c.req.json();
    const parsed = UpdateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateCourse(supabase, courseId, auth.instructorId, parsed.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InstructorServiceError, unknown>;
      if (errorResult.error.code === instructorErrorCodes.fetchError) {
        logger.error('Failed to update course', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 코스 삭제
  instructor.delete('/courses/:id', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await deleteCourse(supabase, courseId, auth.instructorId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InstructorServiceError, unknown>;
      if (errorResult.error.code === instructorErrorCodes.fetchError) {
        logger.error('Failed to delete course', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 학생 현황 조회
  instructor.get('/courses/:id/students', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const supabase = getSupabase(c);

    const result = await getCourseStudents(supabase, courseId, auth.instructorId);
    return respond(c, result);
  });

  // 코스 잠금
  instructor.post('/courses/:id/lock', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await lockCourse(supabase, courseId, auth.instructorId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InstructorServiceError, unknown>;
      if (errorResult.error.code === instructorErrorCodes.fetchError) {
        logger.error('Failed to lock course', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 매칭 실행 (미리보기)
  instructor.post('/courses/:id/match', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const body = await c.req.json();
    const parsed = MatchCourseSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const result = await runMatching(supabase, courseId, auth.instructorId, parsed.data.weightProfile);
    return respond(c, result);
  });

  // 매칭 확정
  instructor.post('/courses/:id/confirm', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const body = await c.req.json();
    const parsed = ConfirmTeamsSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await confirmMatching(supabase, courseId, auth.instructorId, parsed.data.teams);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InstructorServiceError, unknown>;
      if (errorResult.error.code === instructorErrorCodes.fetchError) {
        logger.error('Failed to confirm matching', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 팀 결과 조회
  instructor.get('/courses/:id/teams', async (c) => {
    const auth = getAuth(c) as InstructorPayload | undefined;
    if (!auth || auth.role !== 'instructor') {
      return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
    }

    const courseId = c.req.param('id');
    const supabase = getSupabase(c);

    const result = await getCourseTeams(supabase, courseId, auth.instructorId);
    return respond(c, result);
  });

  app.route('/api/instructor', instructor);
};


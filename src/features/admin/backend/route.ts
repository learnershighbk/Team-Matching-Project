import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { requireAuth } from '@/backend/middleware/auth';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { zodErrorToResponse } from '@/lib/errors';
import {
  CreateInstructorSchema,
  UpdateInstructorSchema,
  ResetStudentPinSchema,
  UpdateCourseDeadlineSchema,
} from './schema';
import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  resetStudentPin,
  getCourses,
  updateCourseDeadline,
} from './service';
import { adminErrorCodes, type AdminServiceError } from './error';
import { hashPassword } from '@/lib/auth/hash';

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

  // 교수자 목록 조회
  admin.get('/instructors', async (c) => {
    const supabase = getSupabase(c);
    const result = await getInstructors(supabase);
    return respond(c, result);
  });

  // 교수자 생성
  admin.post('/instructors', async (c) => {
    const body = await c.req.json();
    const parsed = CreateInstructorSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // PIN 해싱
    const pinHash = await hashPassword(parsed.data.pin);

    const result = await createInstructor(supabase, {
      email: parsed.data.email,
      pinHash,
      name: parsed.data.name,
    });

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdminServiceError, unknown>;
      if (errorResult.error.code === adminErrorCodes.fetchError) {
        logger.error('Failed to create instructor', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 교수자 수정
  admin.put('/instructors/:id', async (c) => {
    const instructorId = c.req.param('id');
    const body = await c.req.json();
    const parsed = UpdateInstructorSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const updateData: { email?: string; pinHash?: string; name?: string } = {};
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.pin !== undefined) {
      updateData.pinHash = await hashPassword(parsed.data.pin);
    }

    const result = await updateInstructor(supabase, instructorId, updateData);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdminServiceError, unknown>;
      if (errorResult.error.code === adminErrorCodes.fetchError) {
        logger.error('Failed to update instructor', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 교수자 삭제
  admin.delete('/instructors/:id', async (c) => {
    const instructorId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await deleteInstructor(supabase, instructorId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdminServiceError, unknown>;
      if (errorResult.error.code === adminErrorCodes.fetchError) {
        logger.error('Failed to delete instructor', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 학생 PIN 리셋
  admin.put('/students/:id/reset-pin', async (c) => {
    const studentId = c.req.param('id');
    const body = await c.req.json();
    const parsed = ResetStudentPinSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // PIN 해싱
    const pinHash = await hashPassword(parsed.data.pin);

    const result = await resetStudentPin(supabase, studentId, pinHash);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdminServiceError, unknown>;
      if (errorResult.error.code === adminErrorCodes.fetchError) {
        logger.error('Failed to reset student PIN', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // 코스 목록 조회
  admin.get('/courses', async (c) => {
    const status = c.req.query('status') || 'all';
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const supabase = getSupabase(c);

    const result = await getCourses(supabase, { status, page, limit });
    return respond(c, result);
  });

  // 코스 마감일 수정
  admin.put('/courses/:id/deadline', async (c) => {
    const courseId = c.req.param('id');
    const body = await c.req.json();
    const parsed = UpdateCourseDeadlineSchema.safeParse(body);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateCourseDeadline(supabase, courseId, parsed.data.deadline);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdminServiceError, unknown>;
      if (errorResult.error.code === adminErrorCodes.fetchError) {
        logger.error('Failed to update course deadline', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.route('/api/admin', admin);
};


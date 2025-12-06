import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { adminErrorCodes, type AdminServiceError } from './error';
import type { Instructor, Course } from '../types';

/**
 * Admin Feature 비즈니스 로직
 */

// 교수자 목록 조회
export async function getInstructors(
  supabase: SupabaseClient
): Promise<HandlerResult<Instructor[], AdminServiceError, unknown>> {
  const { data, error } = await supabase
    .from('instructors')
    .select(`
      instructor_id,
      email,
      name,
      created_at,
      courses(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  const instructors: Instructor[] = (data || []).map((row: any) => ({
    instructorId: row.instructor_id,
    email: row.email,
    name: row.name,
    courseCount: Array.isArray(row.courses) ? row.courses.length : 0,
    createdAt: row.created_at,
    updatedAt: row.created_at, // updated_at이 없으면 created_at 사용
  }));

  return success(instructors);
}

// 교수자 생성
export async function createInstructor(
  supabase: SupabaseClient,
  data: { email: string; pinHash: string; name: string }
): Promise<HandlerResult<Instructor, AdminServiceError, unknown>> {
  const { data: instructor, error } = await supabase
    .from('instructors')
    .insert({
      email: data.email,
      pin_hash: data.pinHash,
      name: data.name,
    })
    .select('instructor_id, email, name, created_at')
    .single();

  if (error) {
    // 중복 이메일 에러
    if (error.code === '23505') {
      return failure(400, adminErrorCodes.duplicateEmail, '이미 등록된 이메일입니다');
    }
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  return success({
    instructorId: instructor.instructor_id,
    email: instructor.email,
    name: instructor.name,
    createdAt: instructor.created_at,
    updatedAt: instructor.created_at,
  });
}

// 교수자 수정
export async function updateInstructor(
  supabase: SupabaseClient,
  instructorId: string,
  data: { email?: string; pinHash?: string; name?: string }
): Promise<HandlerResult<Instructor, AdminServiceError, unknown>> {
  const updateData: any = {};
  if (data.email !== undefined) updateData.email = data.email;
  if (data.pinHash !== undefined) updateData.pin_hash = data.pinHash;
  if (data.name !== undefined) updateData.name = data.name;

  const { data: instructor, error } = await supabase
    .from('instructors')
    .update(updateData)
    .eq('instructor_id', instructorId)
    .select('instructor_id, email, name, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return failure(400, adminErrorCodes.duplicateEmail, '이미 등록된 이메일입니다');
    }
    if (error.code === 'PGRST116') {
      return failure(404, adminErrorCodes.notFound, '교수자를 찾을 수 없습니다');
    }
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  return success({
    instructorId: instructor.instructor_id,
    email: instructor.email,
    name: instructor.name,
    createdAt: instructor.created_at,
    updatedAt: instructor.updated_at || instructor.created_at,
  });
}

// 교수자 삭제
export async function deleteInstructor(
  supabase: SupabaseClient,
  instructorId: string
): Promise<HandlerResult<{ deleted: boolean }, AdminServiceError, unknown>> {
  // 진행 중인 코스 확인
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('course_id, status')
    .eq('instructor_id', instructorId)
    .in('status', ['OPEN', 'LOCKED']);

  if (coursesError) {
    return failure(500, adminErrorCodes.fetchError, coursesError.message);
  }

  if (courses && courses.length > 0) {
    return failure(400, adminErrorCodes.cannotDelete, '진행 중인 코스가 있어 삭제할 수 없습니다');
  }

  const { error } = await supabase
    .from('instructors')
    .delete()
    .eq('instructor_id', instructorId);

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, adminErrorCodes.notFound, '교수자를 찾을 수 없습니다');
    }
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  return success({ deleted: true });
}

// 학생 PIN 리셋
export async function resetStudentPin(
  supabase: SupabaseClient,
  studentId: string,
  pinHash: string
): Promise<HandlerResult<{ studentId: string; pinReset: boolean }, AdminServiceError, unknown>> {
  const { data: student, error } = await supabase
    .from('students')
    .update({ pin_hash: pinHash })
    .eq('student_id', studentId)
    .select('student_id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, adminErrorCodes.notFound, '학생을 찾을 수 없습니다');
    }
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  return success({
    studentId: student.student_id,
    pinReset: true,
  });
}

// 코스 목록 조회
export async function getCourses(
  supabase: SupabaseClient,
  options: { status?: string; page?: number; limit?: number } = {}
): Promise<HandlerResult<{ courses: Course[]; pagination: { page: number; limit: number; total: number } }, AdminServiceError, unknown>> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('courses')
    .select(`
      course_id,
      instructor_id,
      course_name,
      course_code,
      team_size,
      weight_profile,
      deadline,
      status,
      created_at,
      updated_at,
      instructors(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  const { data, error, count } = await query;

  if (error) {
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  const courses: Course[] = (data || []).map((row: any) => ({
    courseId: row.course_id,
    instructorId: row.instructor_id,
    instructorName: row.instructors?.name,
    courseName: row.course_name,
    courseCode: row.course_code,
    teamSize: row.team_size,
    weightProfile: row.weight_profile,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }));

  return success({
    courses,
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  });
}

// 코스 마감일 수정
export async function updateCourseDeadline(
  supabase: SupabaseClient,
  courseId: string,
  deadline: string
): Promise<HandlerResult<{ courseId: string; deadline: string }, AdminServiceError, unknown>> {
  const { data: course, error } = await supabase
    .from('courses')
    .update({ deadline })
    .eq('course_id', courseId)
    .select('course_id, deadline')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, adminErrorCodes.notFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, adminErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: course.course_id,
    deadline: course.deadline,
  });
}


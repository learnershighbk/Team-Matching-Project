import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { courseErrorCodes, type CourseServiceError } from './error';
import type { CourseStatus } from '../types';

/**
 * Course Feature 비즈니스 로직
 */

// 코스 상태 조회 로직 (공개)
export async function getCourseStatus(
  supabase: SupabaseClient,
  courseId: string
): Promise<HandlerResult<CourseStatus, CourseServiceError, unknown>> {
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      course_id,
      course_name,
      course_code,
      status,
      deadline,
      team_size,
      instructors(name)
    `)
    .eq('course_id', courseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, courseErrorCodes.notFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, courseErrorCodes.fetchError, error.message);
  }

  const deadline = new Date(course.deadline);
  const now = new Date();
  const isDeadlinePassed = deadline < now;

  // 학생 수 계산
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { count: completedCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .eq('profile_completed', true);

  const profileCompletionRate = studentCount && studentCount > 0
    ? (completedCount || 0) / studentCount
    : 0;

  return success({
    courseId: course.course_id,
    courseName: course.course_name,
    courseCode: course.course_code,
    status: course.status,
    deadline: course.deadline,
    isDeadlinePassed,
    teamSize: course.team_size,
    studentCount: studentCount || 0,
    profileCompletionRate,
  });
}


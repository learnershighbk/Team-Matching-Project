import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin Feature 비즈니스 로직
 */

// TODO: 교수자 목록 조회 로직
export async function getInstructors(supabase: SupabaseClient) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 교수자 생성 로직
export async function createInstructor(
  supabase: SupabaseClient,
  data: { email: string; pinHash: string; name: string }
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 교수자 수정 로직
export async function updateInstructor(
  supabase: SupabaseClient,
  instructorId: string,
  data: { email?: string; pinHash?: string; name?: string }
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 교수자 삭제 로직
export async function deleteInstructor(
  supabase: SupabaseClient,
  instructorId: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 학생 PIN 리셋 로직
export async function resetStudentPin(
  supabase: SupabaseClient,
  studentId: string,
  pinHash: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 목록 조회 로직
export async function getCourses(supabase: SupabaseClient) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 마감일 수정 로직
export async function updateCourseDeadline(
  supabase: SupabaseClient,
  courseId: string,
  deadline: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}


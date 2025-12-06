import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Instructor Feature 비즈니스 로직
 */

// TODO: 코스 목록 조회 로직
export async function getCourses(supabase: SupabaseClient, instructorId: string) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 생성 로직
export async function createCourse(
  supabase: SupabaseClient,
  instructorId: string,
  data: {
    courseName: string;
    courseCode: string;
    teamSize: number;
    weightProfile: string;
    deadline: string;
  }
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 상세 조회 로직
export async function getCourseById(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 수정 로직
export async function updateCourse(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string,
  data: {
    courseName?: string;
    courseCode?: string;
    teamSize?: number;
    weightProfile?: string;
    deadline?: string;
  }
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 코스 삭제 로직
export async function deleteCourse(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 학생 현황 조회 로직
export async function getCourseStudents(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 매칭 실행 로직
export async function runMatching(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string,
  weightProfile?: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 매칭 확정 로직
export async function confirmMatching(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string,
  teams: unknown[]
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 팀 결과 조회 로직
export async function getCourseTeams(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}


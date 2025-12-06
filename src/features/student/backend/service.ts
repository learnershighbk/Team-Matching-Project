import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Student Feature 비즈니스 로직
 */

// TODO: 프로필 조회 로직
export async function getProfile(supabase: SupabaseClient, studentId: string) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 프로필 수정 로직
export async function updateProfile(
  supabase: SupabaseClient,
  studentId: string,
  data: {
    name: string;
    email: string;
    major: string;
    gender: string;
    continent: string;
    role: string;
    skill: string;
    times: string[];
    goal: string;
  }
) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}

// TODO: 팀 결과 조회 로직
export async function getTeam(supabase: SupabaseClient, studentId: string) {
  // Implementation will be added in Phase 2
  throw new Error('Not implemented');
}


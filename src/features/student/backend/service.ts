import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { studentErrorCodes, type StudentServiceError } from './error';
import type { StudentProfile, Team } from '../types';
import type { UpdateProfileInput } from './schema';

/**
 * Student Feature 비즈니스 로직
 */

// 프로필 조회
export async function getProfile(
  supabase: SupabaseClient,
  studentId: string
): Promise<HandlerResult<{
  studentId: string;
  studentNumber: string;
  courseId: string;
  courseStatus: string;
  profile: {
    name?: string;
    email?: string;
    major?: string;
    gender?: string;
    continent?: string;
    role?: string;
    skill?: string;
    times?: string[];
    goal?: string;
  };
  profileCompleted: boolean;
}, StudentServiceError, unknown>> {
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      student_id,
      student_number,
      course_id,
      name,
      email,
      major,
      gender,
      continent,
      role,
      skill,
      times,
      goal,
      profile_completed,
      courses(status)
    `)
    .eq('student_id', studentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, studentErrorCodes.notFound, '학생을 찾을 수 없습니다');
    }
    return failure(500, studentErrorCodes.fetchError, error.message);
  }

  return success({
    studentId: student.student_id,
    studentNumber: student.student_number,
    courseId: student.course_id,
    courseStatus: (student.courses as any)?.status || 'UNKNOWN',
    profile: {
      name: student.name || undefined,
      email: student.email || undefined,
      major: student.major || undefined,
      gender: student.gender || undefined,
      continent: student.continent || undefined,
      role: student.role || undefined,
      skill: student.skill || undefined,
      times: student.times || [],
      goal: student.goal || undefined,
    },
    profileCompleted: student.profile_completed,
  });
}

// 프로필 수정
export async function updateProfile(
  supabase: SupabaseClient,
  studentId: string,
  data: UpdateProfileInput
): Promise<HandlerResult<{ profileCompleted: boolean; message: string }, StudentServiceError, unknown>> {
  // 코스 마감일 확인
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('course_id, courses(deadline, status)')
    .eq('student_id', studentId)
    .single();

  if (studentError) {
    if (studentError.code === 'PGRST116') {
      return failure(404, studentErrorCodes.notFound, '학생을 찾을 수 없습니다');
    }
    return failure(500, studentErrorCodes.fetchError, studentError.message);
  }

  const course = student.courses as any;
  const deadline = new Date(course.deadline);
  const now = new Date();

  if (deadline < now) {
    return failure(403, studentErrorCodes.deadlinePassed, '프로필 입력 마감기한이 지났습니다');
  }

  if (course.status !== 'OPEN') {
    return failure(403, studentErrorCodes.deadlinePassed, '프로필 입력 마감기한이 지났습니다');
  }

  const { data: updatedStudent, error } = await supabase
    .from('students')
    .update({
      name: data.name,
      email: data.email,
      major: data.major,
      gender: data.gender,
      continent: data.continent,
      role: data.role,
      skill: data.skill,
      times: data.times,
      goal: data.goal,
    })
    .eq('student_id', studentId)
    .select('profile_completed')
    .single();

  if (error) {
    return failure(500, studentErrorCodes.fetchError, error.message);
  }

  return success({
    profileCompleted: updatedStudent.profile_completed,
    message: '프로필이 저장되었습니다',
  });
}

// 팀 결과 조회
export async function getTeam(
  supabase: SupabaseClient,
  studentId: string
): Promise<HandlerResult<{
  hasTeam: boolean;
  teamId?: string;
  courseId?: string;
  teamNumber?: number;
  memberCount?: number;
  topFactors?: string[];
  matchDescription?: string;
  members?: Array<{ studentId: string; studentNumber: string; name?: string; email?: string }>;
  createdAt?: string;
  courseStatus?: string;
  message?: string;
}, StudentServiceError, unknown>> {
  // 학생 정보 및 코스 상태 조회
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      student_id,
      team_id,
      course_id,
      courses(status),
      teams(
        team_id,
        team_number,
        top_factors,
        created_at,
        students(
          student_id,
          student_number,
          name,
          major,
          email
        )
      )
    `)
    .eq('student_id', studentId)
    .single();

  if (studentError) {
    if (studentError.code === 'PGRST116') {
      return failure(404, studentErrorCodes.notFound, '학생을 찾을 수 없습니다');
    }
    return failure(500, studentErrorCodes.fetchError, studentError.message);
  }

  const course = student.courses as any;
  const courseStatus = course.status;

  // 팀이 없는 경우
  if (!student.team_id || !student.teams) {
    return success({
      hasTeam: false,
      courseStatus,
      message: courseStatus === 'CONFIRMED' ? '팀 배정 정보를 찾을 수 없습니다' : courseStatus === 'LOCKED' ? '매칭 결과를 기다리고 있습니다' : '아직 매칭되지 않았습니다',
    });
  }

  const team = student.teams as any;
  const allMembers = (team.students || []) as Array<{
    student_id: string;
    student_number: string;
    name?: string;
    email?: string;
  }>;

  // 모든 팀원 포함 (본인 포함)
  const members = allMembers.map((s: any) => ({
    studentId: s.student_id,
    studentNumber: s.student_number,
    name: s.name || undefined,
    email: s.email || undefined,
  }));

  // 매칭 설명 생성
  const factors = team.top_factors || [];
  const factorDescriptions: Record<string, string> = {
    time: '시간대(Time)',
    skill: '역량 균형(Skill)',
    role: '역할 분배(Role)',
    major: '전공 다양성(Major)',
    goal: '목표 일치(Goal)',
    continent: '대륙 다양성(Continent)',
    gender: '성별 균형(Gender)',
  };

  const matchDescription = factors.length > 0
    ? `이 팀은 ${factors.map(f => factorDescriptions[f] || f).join(' 및 ')} 측면에서 가장 적합하게 매칭되었습니다.`
    : '이 팀은 최적의 매칭으로 구성되었습니다.';

  // courseId 가져오기
  const courseId = student.course_id;

  return success({
    hasTeam: true,
    teamId: team.team_id,
    courseId: courseId,
    teamNumber: team.team_number,
    memberCount: members.length,
    topFactors: factors,
    matchDescription,
    members,
    createdAt: team.created_at || new Date().toISOString(),
  });
}


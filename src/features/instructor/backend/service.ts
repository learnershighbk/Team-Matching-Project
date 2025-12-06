import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { instructorErrorCodes, type InstructorServiceError } from './error';
import type { Course, StudentStatus, Team } from '../types';
import type { CreateCourseInput, UpdateCourseInput } from './schema';

/**
 * Instructor Feature 비즈니스 로직
 */

// 코스 목록 조회
export async function getCourses(
  supabase: SupabaseClient,
  instructorId: string
): Promise<HandlerResult<Course[], InstructorServiceError, unknown>> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('course_id, course_name, course_code, team_size, weight_profile, status, deadline, created_at')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  // 각 코스의 학생 수와 완료 수 조회
  const coursesWithCounts = await Promise.all((courses || []).map(async (course) => {
    const { count: totalCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.course_id);

    const { count: completedCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.course_id)
      .eq('profile_completed', true);

    return {
      courseId: course.course_id,
      courseName: course.course_name,
      courseCode: course.course_code,
      teamSize: course.team_size,
      weightProfile: course.weight_profile,
      status: course.status,
      deadline: course.deadline,
      studentCount: totalCount || 0,
      completedCount: completedCount || 0,
      accessUrl: `/course/${course.course_id}`,
    };
  }));

  return success(coursesWithCounts);
}

// 코스 생성
export async function createCourse(
  supabase: SupabaseClient,
  instructorId: string,
  data: CreateCourseInput
): Promise<HandlerResult<{ courseId: string; courseName: string; courseCode: string; accessUrl: string }, InstructorServiceError, unknown>> {
  // deadline 검증 (현재 시간 이후)
  const deadlineDate = new Date(data.deadline);
  if (deadlineDate <= new Date()) {
    return failure(400, instructorErrorCodes.validationError, '마감일은 현재 시간 이후여야 합니다');
  }

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      instructor_id: instructorId,
      course_name: data.courseName,
      course_code: data.courseCode,
      team_size: data.teamSize,
      weight_profile: data.weightProfile,
      deadline: data.deadline,
      status: 'OPEN',
    })
    .select('course_id, course_name, course_code')
    .single();

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: course.course_id,
    courseName: course.course_name,
    courseCode: course.course_code,
    accessUrl: `/course/${course.course_id}`,
  });
}

// 코스 상세 조회
export async function getCourseById(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<Course, InstructorServiceError, unknown>> {
  const { data: course, error } = await supabase
    .from('courses')
    .select('course_id, course_name, course_code, team_size, weight_profile, status, deadline, created_at, updated_at')
    .eq('course_id', courseId)
    .eq('instructor_id', instructorId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: course.course_id,
    courseName: course.course_name,
    courseCode: course.course_code,
    teamSize: course.team_size,
    weightProfile: course.weight_profile,
    status: course.status,
    deadline: course.deadline,
    createdAt: course.created_at,
    updatedAt: course.updated_at || course.created_at,
  });
}

// 코스 수정
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
): Promise<HandlerResult<Partial<Course>, InstructorServiceError, unknown>> {
  // 현재 코스 상태 확인
  const { data: currentCourse, error: fetchError } = await supabase
    .from('courses')
    .select('status, instructor_id')
    .eq('course_id', courseId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, instructorErrorCodes.fetchError, fetchError.message);
  }

  if (currentCourse.instructor_id !== instructorId) {
    return failure(403, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  if (currentCourse.status === 'LOCKED' || currentCourse.status === 'CONFIRMED') {
    return failure(403, instructorErrorCodes.cannotModify, 'LOCKED 또는 CONFIRMED 상태에서는 수정할 수 없습니다');
  }

  const updateData: any = {};
  if (data.courseName !== undefined) updateData.course_name = data.courseName;
  if (data.courseCode !== undefined) updateData.course_code = data.courseCode;
  if (data.teamSize !== undefined) updateData.team_size = data.teamSize;
  if (data.weightProfile !== undefined) updateData.weight_profile = data.weightProfile;
  if (data.deadline !== undefined) {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      return failure(400, instructorErrorCodes.validationError, '마감일은 현재 시간 이후여야 합니다');
    }
    updateData.deadline = data.deadline;
  }

  const { data: course, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('course_id', courseId)
    .select('course_id, team_size, weight_profile, deadline')
    .single();

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: course.course_id,
    teamSize: course.team_size,
    weightProfile: course.weight_profile,
    deadline: course.deadline,
  });
}

// 코스 삭제
export async function deleteCourse(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<{ deleted: boolean }, InstructorServiceError, unknown>> {
  // 코스 소유권 확인
  const { data: course, error: fetchError } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('course_id', courseId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, instructorErrorCodes.fetchError, fetchError.message);
  }

  if (course.instructor_id !== instructorId) {
    return failure(403, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('course_id', courseId);

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({ deleted: true });
}

// 학생 현황 조회
export async function getCourseStudents(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<{ total: number; completed: number; students: StudentStatus[] }, InstructorServiceError, unknown>> {
  // 코스 소유권 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('course_id', courseId)
    .single();

  if (courseError || !course || course.instructor_id !== instructorId) {
    return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  const { data: students, error } = await supabase
    .from('students')
    .select(`
      student_id,
      student_number,
      name,
      email,
      major,
      profile_completed,
      team_id,
      teams(team_number)
    `)
    .eq('course_id', courseId)
    .order('student_number', { ascending: true });

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  const total = students?.length || 0;
  const completed = students?.filter(s => s.profile_completed).length || 0;

  const studentStatuses: StudentStatus[] = (students || []).map((s: any) => ({
    studentId: s.student_id,
    studentNumber: s.student_number,
    name: s.name,
    email: s.email,
    major: s.major,
    profileCompleted: s.profile_completed,
    teamNumber: s.teams?.team_number || null,
  }));

  return success({
    total,
    completed,
    students: studentStatuses,
  });
}

// 코스 잠금 (OPEN → LOCKED)
export async function lockCourse(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<{ courseId: string; status: string; studentCount: number }, InstructorServiceError, unknown>> {
  // 코스 소유권 및 상태 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id, status')
    .eq('course_id', courseId)
    .single();

  if (courseError || !course || course.instructor_id !== instructorId) {
    return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  if (course.status === 'LOCKED') {
    return failure(400, instructorErrorCodes.alreadyLocked, '이미 LOCKED 상태입니다');
  }

  if (course.status !== 'OPEN') {
    return failure(400, instructorErrorCodes.cannotModify, 'OPEN 상태에서만 잠금할 수 있습니다');
  }

  // 학생 수 확인 (최소 2명)
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (!studentCount || studentCount < 2) {
    return failure(400, instructorErrorCodes.matchInsufficientStudents, '최소 2명의 학생이 필요합니다');
  }

  const { data: updatedCourse, error } = await supabase
    .from('courses')
    .update({ status: 'LOCKED' })
    .eq('course_id', courseId)
    .select('course_id, status')
    .single();

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: updatedCourse.course_id,
    status: updatedCourse.status,
    studentCount: studentCount || 0,
  });
}

// 매칭 실행 (미리보기)
export async function runMatching(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string,
  weightProfile?: string
): Promise<HandlerResult<{
  teams: Team[];
  summary: {
    teamCount: number;
    averageScore: number;
    scoreStdDev: number;
    minScore: number;
    maxScore: number;
  };
}, InstructorServiceError, unknown>> {
  // 코스 소유권 및 상태 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id, status, team_size, weight_profile')
    .eq('course_id', courseId)
    .single();

  if (courseError || !course) {
    if (courseError?.code === 'PGRST116') {
      return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
    }
    return failure(500, instructorErrorCodes.fetchError, courseError?.message || '코스 조회 실패');
  }

  if (course.instructor_id !== instructorId) {
    return failure(403, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  if (course.status !== 'LOCKED') {
    return failure(400, instructorErrorCodes.cannotMatch, 'LOCKED 상태에서만 매칭을 실행할 수 있습니다');
  }

  // 프로필 완료된 학생 조회
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select(`
      student_id,
      student_number,
      name,
      email,
      major,
      gender,
      continent,
      role,
      skill,
      times,
      goal
    `)
    .eq('course_id', courseId)
    .eq('profile_completed', true);

  if (studentError) {
    return failure(500, instructorErrorCodes.fetchError, studentError.message);
  }

  if (!students || students.length < 2) {
    return failure(400, instructorErrorCodes.matchInsufficientStudents, '최소 2명의 프로필 완료 학생이 필요합니다');
  }

  // 매칭 알고리즘 실행
  try {
    const { runMatching: runMatchingAlgorithm } = await import('@/features/matching/algorithm');
    
    const finalWeightProfile = weightProfile || course.weight_profile;
    const result = runMatchingAlgorithm({
      students: students.map(s => ({
        studentId: s.student_id,
        studentNumber: s.student_number,
        name: s.name || undefined,
        email: s.email || undefined,
        major: s.major || undefined,
        gender: s.gender || undefined,
        continent: s.continent || undefined,
        role: s.role || undefined,
        skill: s.skill || undefined,
        times: s.times || [],
        goal: s.goal || undefined,
      })),
      teamSize: course.team_size,
      weightProfile: finalWeightProfile,
    });

    // 결과를 API 응답 형식으로 변환
    const teams: Team[] = result.teams.map(team => ({
      teamId: '', // 미리보기는 DB에 저장하지 않음
      courseId: courseId,
      teamNumber: team.teamNumber,
      memberCount: team.memberCount,
      scoreTotal: team.totalScore,
      scoreBreakdown: team.scores ? {
        time: team.scores.time,
        skill: team.scores.skill,
        role: team.scores.role,
        major: team.scores.major,
        goal: team.scores.goal,
        continent: team.scores.continent,
        gender: team.scores.gender,
      } : undefined,
      topFactors: team.topFactors,
      members: team.members.map(m => ({
        studentId: m.studentId,
        studentNumber: m.studentNumber,
        name: m.name,
        email: m.email,
        major: m.major,
        gender: m.gender,
        continent: m.continent,
        role: m.role,
        skill: m.skill,
        times: m.times,
        goal: m.goal,
      })),
      createdAt: new Date().toISOString(),
    }));

    return success({
      teams,
      summary: {
        teamCount: result.summary.teamCount,
        averageScore: result.summary.averageScore,
        scoreStdDev: result.summary.scoreStdDev,
        minScore: result.summary.minScore,
        maxScore: result.summary.maxScore,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // MATCH_001 에러 처리
      if (error.message.includes('MATCH_001')) {
        return failure(400, instructorErrorCodes.matchInsufficientStudents, error.message.split(':')[1]?.trim() || '최소 2명의 학생이 필요합니다');
      }
      return failure(500, instructorErrorCodes.fetchError, error.message);
    }
    return failure(500, instructorErrorCodes.fetchError, '매칭 실행 중 오류가 발생했습니다');
  }
}

// 매칭 확정 (LOCKED → CONFIRMED) - Phase 3에서 구현
export async function confirmMatching(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<{ courseId: string; status: string; teamCount: number }, InstructorServiceError, unknown>> {
  // 코스 소유권 및 상태 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id, status')
    .eq('course_id', courseId)
    .single();

  if (courseError || !course || course.instructor_id !== instructorId) {
    return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  if (course.status === 'CONFIRMED') {
    return failure(400, instructorErrorCodes.alreadyConfirmed, '이미 확정된 코스입니다');
  }

  if (course.status !== 'LOCKED') {
    return failure(400, instructorErrorCodes.cannotMatch, 'LOCKED 상태에서만 확정할 수 있습니다');
  }

  // 팀 존재 확인
  const { count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (!teamCount || teamCount === 0) {
    return failure(400, instructorErrorCodes.matchNotRun, '먼저 매칭을 실행해주세요');
  }

  const { data: updatedCourse, error } = await supabase
    .from('courses')
    .update({ status: 'CONFIRMED' })
    .eq('course_id', courseId)
    .select('course_id, status')
    .single();

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  return success({
    courseId: updatedCourse.course_id,
    status: updatedCourse.status,
    teamCount: teamCount || 0,
  });
}

// 팀 결과 조회
export async function getCourseTeams(
  supabase: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<{ status: string; teams: Team[]; summary: { teamCount: number; averageScore: number; scoreStdDev: number } }, InstructorServiceError, unknown>> {
  // 코스 소유권 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id, status')
    .eq('course_id', courseId)
    .single();

  if (courseError || !course || course.instructor_id !== instructorId) {
    return failure(404, instructorErrorCodes.courseNotFound, '코스를 찾을 수 없습니다');
  }

  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      team_id,
      team_number,
      member_count,
      score_total,
      score_time,
      score_skill,
      score_role,
      score_major,
      score_goal,
      score_continent,
      score_gender,
      top_factors,
      students(
        student_id,
        student_number,
        name,
        email,
        major,
        gender,
        continent,
        role,
        skill,
        times,
        goal
      )
    `)
    .eq('course_id', courseId)
    .order('team_number', { ascending: true });

  if (error) {
    return failure(500, instructorErrorCodes.fetchError, error.message);
  }

  const teamList: Team[] = (teams || []).map((t: any) => ({
    teamId: t.team_id,
    courseId: courseId,
    teamNumber: t.team_number,
    memberCount: t.member_count,
    scoreTotal: parseFloat(t.score_total || '0'),
    scoreBreakdown: {
      time: parseFloat(t.score_time || '0'),
      skill: parseFloat(t.score_skill || '0'),
      role: parseFloat(t.score_role || '0'),
      major: parseFloat(t.score_major || '0'),
      goal: parseFloat(t.score_goal || '0'),
      continent: parseFloat(t.score_continent || '0'),
      gender: parseFloat(t.score_gender || '0'),
    },
    topFactors: t.top_factors || [],
    members: (t.students || []).map((s: any) => ({
      studentId: s.student_id,
      studentNumber: s.student_number,
      name: s.name,
      email: s.email,
      major: s.major,
      gender: s.gender,
      continent: s.continent,
      role: s.role,
      skill: s.skill,
      times: s.times || [],
      goal: s.goal,
    })),
    createdAt: new Date().toISOString(),
  }));

  // 통계 계산
  const scores = teamList.map(t => t.scoreTotal || 0);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const variance = scores.length > 0
    ? scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
    : 0;
  const scoreStdDev = Math.sqrt(variance);

  return success({
    status: course.status,
    teams: teamList,
    summary: {
      teamCount: teamList.length,
      averageScore,
      scoreStdDev,
    },
  });
}


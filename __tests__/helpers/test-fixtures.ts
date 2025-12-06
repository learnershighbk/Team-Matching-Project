/**
 * 테스트 데이터 팩토리
 *
 * 테스트에서 사용할 목 데이터 생성 유틸리티
 */

import type { Instructor, Course as AdminCourse, Student as AdminStudent } from '@/features/admin/types';
import type { Course, StudentStatus, Team, TeamMember } from '@/features/instructor/types';
import type { StudentProfile } from '@/features/student/types';

// UUID 생성 헬퍼
let idCounter = 0;
export function generateId(): string {
  idCounter += 1;
  return `test-uuid-${idCounter.toString().padStart(8, '0')}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// 기본 날짜 생성
const now = new Date();
const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일 후
const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7일 전

/**
 * Mock Instructor 생성
 */
export function createMockInstructor(overrides: Partial<Instructor> = {}): Instructor {
  const id = generateId();
  return {
    instructorId: id,
    email: `instructor-${id}@test.com`,
    name: `Test Instructor ${id}`,
    courseCount: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * Mock Course 생성 (Admin 타입)
 */
export function createMockAdminCourse(overrides: Partial<AdminCourse> = {}): AdminCourse {
  const id = generateId();
  return {
    courseId: id,
    instructorId: generateId(),
    instructorName: 'Test Instructor',
    courseName: `Test Course ${id}`,
    courseCode: `TC${id.slice(-4)}`,
    teamSize: 4,
    weightProfile: 'balanced',
    deadline: futureDate.toISOString(),
    status: 'OPEN',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * Mock Course 생성 (Instructor 타입)
 */
export function createMockCourse(overrides: Partial<Course> = {}): Course {
  const id = generateId();
  return {
    courseId: id,
    instructorId: generateId(),
    courseName: `Test Course ${id}`,
    courseCode: `TC${id.slice(-4)}`,
    teamSize: 4,
    weightProfile: 'balanced',
    deadline: futureDate.toISOString(),
    status: 'OPEN',
    studentCount: 0,
    completedCount: 0,
    ...overrides,
  };
}

/**
 * Mock Student 생성 (Admin 타입)
 */
export function createMockAdminStudent(overrides: Partial<AdminStudent> = {}): AdminStudent {
  const id = generateId();
  const studentNumber = `2024${id.slice(-5).replace(/-/g, '')}`.slice(0, 9);
  return {
    studentId: id,
    courseId: generateId(),
    studentNumber,
    name: `Student ${id}`,
    email: `student-${id}@test.com`,
    profileCompleted: false,
    createdAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * Mock Student 생성 (프로필 완료된 상태)
 */
export function createMockStudent(overrides: Partial<StudentProfile> = {}): StudentProfile {
  const id = generateId();
  const studentNumber = `2024${id.slice(-5).replace(/-/g, '')}`.slice(0, 9);
  return {
    studentId: id,
    courseId: generateId(),
    studentNumber,
    name: `Student ${id}`,
    email: `student-${id}@test.com`,
    major: 'Computer Science',
    gender: 'male',
    continent: 'Asia',
    role: 'developer',
    skill: 'high',
    times: ['morning', 'afternoon'],
    goal: 'grade',
    profileCompleted: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * Mock StudentStatus 생성
 */
export function createMockStudentStatus(overrides: Partial<StudentStatus> = {}): StudentStatus {
  const id = generateId();
  const studentNumber = `2024${id.slice(-5).replace(/-/g, '')}`.slice(0, 9);
  return {
    studentId: id,
    studentNumber,
    name: `Student ${id}`,
    email: `student-${id}@test.com`,
    major: 'Computer Science',
    profileCompleted: true,
    teamNumber: null,
    ...overrides,
  };
}

/**
 * Mock TeamMember 생성
 */
export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  const id = generateId();
  const studentNumber = `2024${id.slice(-5).replace(/-/g, '')}`.slice(0, 9);
  return {
    studentId: id,
    studentNumber,
    name: `Student ${id}`,
    email: `student-${id}@test.com`,
    major: 'Computer Science',
    gender: 'male',
    continent: 'Asia',
    role: 'developer',
    skill: 'high',
    times: ['morning', 'afternoon'],
    goal: 'grade',
    ...overrides,
  };
}

/**
 * Mock Team 생성
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  const id = generateId();
  const members = overrides.members || [
    createMockTeamMember(),
    createMockTeamMember(),
    createMockTeamMember(),
  ];
  return {
    teamId: id,
    courseId: generateId(),
    teamNumber: 1,
    memberCount: members.length,
    scoreTotal: 85,
    scoreBreakdown: {
      time: 90,
      skill: 80,
      role: 85,
      major: 75,
      goal: 95,
      continent: 70,
      gender: 80,
    },
    topFactors: ['goal', 'time'],
    members,
    createdAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * 여러 학생 생성 (팀 구성용)
 */
export function createMockStudents(count: number, courseId: string): StudentProfile[] {
  return Array.from({ length: count }, (_, i) =>
    createMockStudent({
      courseId,
      profileCompleted: true,
      gender: i % 2 === 0 ? 'male' : 'female',
      continent: ['Asia', 'Europe', 'America'][i % 3],
      role: ['developer', 'designer', 'pm'][i % 3],
      skill: ['high', 'mid', 'low'][i % 3],
      times: i % 2 === 0 ? ['morning', 'afternoon'] : ['afternoon', 'evening'],
      goal: i % 2 === 0 ? 'grade' : 'learning',
    })
  );
}

/**
 * DB Row 형식으로 변환 (Supabase 모킹용)
 */
export function toDbRow<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // camelCase를 snake_case로 변환
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

/**
 * 과거 날짜 생성
 */
export function getPastDate(daysAgo: number = 7): Date {
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * 미래 날짜 생성
 */
export function getFutureDate(daysAhead: number = 7): Date {
  return new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
}

export { futureDate, pastDate, now };

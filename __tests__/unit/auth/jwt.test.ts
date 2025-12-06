/**
 * JWT 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signToken, verifyToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/features/auth/backend/jwt';
import type { AdminPayload, InstructorPayload, StudentPayload } from '@/features/auth/backend/jwt';

describe('JWT 유틸리티', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signToken', () => {
    it('Admin 토큰 생성 성공', async () => {
      const payload: AdminPayload = {
        role: 'admin',
        email: 'admin@test.com',
      };

      const token = await signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식
    });

    it('Instructor 토큰 생성 성공', async () => {
      const payload: InstructorPayload = {
        role: 'instructor',
        instructorId: 'test-instructor-id',
        email: 'instructor@test.com',
      };

      const token = await signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('Student 토큰 생성 성공', async () => {
      const payload: StudentPayload = {
        role: 'student',
        studentId: 'test-student-id',
        courseId: 'test-course-id',
        studentNumber: '202400001',
      };

      const token = await signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('유효한 Admin 토큰 검증 성공', async () => {
      const payload: AdminPayload = {
        role: 'admin',
        email: 'admin@test.com',
      };
      const token = await signToken(payload);

      const result = await verifyToken(token);

      expect(result).not.toBeNull();
      expect(result?.role).toBe('admin');
      expect((result as AdminPayload).email).toBe('admin@test.com');
    });

    it('유효한 Instructor 토큰 검증 성공', async () => {
      const payload: InstructorPayload = {
        role: 'instructor',
        instructorId: 'test-instructor-id',
        email: 'instructor@test.com',
      };
      const token = await signToken(payload);

      const result = await verifyToken(token);

      expect(result).not.toBeNull();
      expect(result?.role).toBe('instructor');
      expect((result as InstructorPayload).instructorId).toBe('test-instructor-id');
      expect((result as InstructorPayload).email).toBe('instructor@test.com');
    });

    it('유효한 Student 토큰 검증 성공', async () => {
      const payload: StudentPayload = {
        role: 'student',
        studentId: 'test-student-id',
        courseId: 'test-course-id',
        studentNumber: '202400001',
      };
      const token = await signToken(payload);

      const result = await verifyToken(token);

      expect(result).not.toBeNull();
      expect(result?.role).toBe('student');
      expect((result as StudentPayload).studentId).toBe('test-student-id');
      expect((result as StudentPayload).courseId).toBe('test-course-id');
    });

    it('잘못된 토큰 거부', async () => {
      const invalidToken = 'invalid.jwt.token';

      const result = await verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it('빈 토큰 거부', async () => {
      const result = await verifyToken('');

      expect(result).toBeNull();
    });

    it('잘못된 형식의 토큰 거부', async () => {
      const malformedToken = 'not-a-valid-jwt';

      const result = await verifyToken(malformedToken);

      expect(result).toBeNull();
    });
  });

  describe('상수 값', () => {
    it('COOKIE_NAME이 정의되어 있음', () => {
      expect(COOKIE_NAME).toBeDefined();
      expect(typeof COOKIE_NAME).toBe('string');
    });

    it('COOKIE_OPTIONS가 올바른 보안 설정을 가짐', () => {
      expect(COOKIE_OPTIONS).toBeDefined();
      expect(COOKIE_OPTIONS.httpOnly).toBe(true);
      expect(COOKIE_OPTIONS.sameSite).toBe('strict');
      expect(COOKIE_OPTIONS.path).toBe('/');
    });
  });
});

describe('토큰 페이로드 타입', () => {
  it('Admin 페이로드는 email을 포함', async () => {
    const payload: AdminPayload = {
      role: 'admin',
      email: 'admin@test.com',
    };
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    if (result && result.role === 'admin') {
      expect((result as AdminPayload).email).toBeDefined();
    }
  });

  it('Instructor 페이로드는 instructorId와 email을 포함', async () => {
    const payload: InstructorPayload = {
      role: 'instructor',
      instructorId: 'test-id',
      email: 'instructor@test.com',
    };
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    if (result && result.role === 'instructor') {
      const instructorResult = result as InstructorPayload;
      expect(instructorResult.instructorId).toBeDefined();
      expect(instructorResult.email).toBeDefined();
    }
  });

  it('Student 페이로드는 studentId, courseId, studentNumber를 포함', async () => {
    const payload: StudentPayload = {
      role: 'student',
      studentId: 'test-student',
      courseId: 'test-course',
      studentNumber: '202400001',
    };
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    if (result && result.role === 'student') {
      const studentResult = result as StudentPayload;
      expect(studentResult.studentId).toBeDefined();
      expect(studentResult.courseId).toBeDefined();
      expect(studentResult.studentNumber).toBeDefined();
    }
  });
});

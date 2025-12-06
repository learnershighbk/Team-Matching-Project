/**
 * Admin Zod 스키마 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  CreateInstructorSchema,
  UpdateInstructorSchema,
  ResetStudentPinSchema,
  UpdateCourseDeadlineSchema,
} from '@/features/admin/backend/schema';

describe('CreateInstructorSchema', () => {
  describe('유효한 데이터', () => {
    it('모든 필드가 올바른 경우 통과', () => {
      const data = {
        email: 'instructor@test.com',
        pin: '1234',
        name: 'Test Instructor',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('최소 길이 이름 허용', () => {
      const data = {
        email: 'instructor@test.com',
        pin: '1234',
        name: 'A',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('최대 길이 이름 허용', () => {
      const data = {
        email: 'instructor@test.com',
        pin: '1234',
        name: 'A'.repeat(100),
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('이메일 검증', () => {
    it('잘못된 이메일 형식 거부', () => {
      const data = {
        email: 'not-an-email',
        pin: '1234',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('올바른 이메일 형식이 아닙니다');
      }
    });

    it('@가 없는 이메일 거부', () => {
      const data = {
        email: 'testexample.com',
        pin: '1234',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('빈 이메일 거부', () => {
      const data = {
        email: '',
        pin: '1234',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('PIN 검증', () => {
    it('4자리가 아닌 PIN 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '123',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN은 4자리 숫자여야 합니다');
      }
    });

    it('5자리 PIN 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '12345',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('문자가 포함된 PIN 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '12ab',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('빈 PIN 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('0000 PIN 허용', () => {
      const data = {
        email: 'test@test.com',
        pin: '0000',
        name: 'Test',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('이름 검증', () => {
    it('빈 이름 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '1234',
        name: '',
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('이름을 입력해주세요');
      }
    });

    it('100자 초과 이름 거부', () => {
      const data = {
        email: 'test@test.com',
        pin: '1234',
        name: 'A'.repeat(101),
      };

      const result = CreateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('이름은 100자 이하여야 합니다');
      }
    });
  });
});

describe('UpdateInstructorSchema', () => {
  describe('유효한 데이터', () => {
    it('모든 필드 업데이트 가능', () => {
      const data = {
        email: 'new@test.com',
        pin: '5678',
        name: 'New Name',
      };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('email만 업데이트', () => {
      const data = { email: 'new@test.com' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('pin만 업데이트', () => {
      const data = { pin: '5678' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('name만 업데이트', () => {
      const data = { name: 'New Name' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('빈 객체 허용', () => {
      const data = {};

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('검증 규칙', () => {
    it('잘못된 이메일 거부', () => {
      const data = { email: 'invalid' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('잘못된 PIN 거부', () => {
      const data = { pin: '123' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('빈 이름 거부', () => {
      const data = { name: '' };

      const result = UpdateInstructorSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});

describe('ResetStudentPinSchema', () => {
  it('유효한 4자리 PIN 허용', () => {
    const data = { pin: '1234' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('0000 PIN 허용', () => {
    const data = { pin: '0000' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('3자리 PIN 거부', () => {
    const data = { pin: '123' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('5자리 PIN 거부', () => {
    const data = { pin: '12345' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('문자 포함 PIN 거부', () => {
    const data = { pin: 'abcd' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('빈 PIN 거부', () => {
    const data = { pin: '' };

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('pin 필드 누락 거부', () => {
    const data = {};

    const result = ResetStudentPinSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe('UpdateCourseDeadlineSchema', () => {
  it('유효한 ISO datetime 허용', () => {
    const data = { deadline: '2024-12-31T23:59:59.000Z' };

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('UTC 날짜 형식 허용', () => {
    const data = { deadline: new Date().toISOString() };

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('잘못된 날짜 형식 거부', () => {
    const data = { deadline: '2024-12-31' };

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('일반 문자열 거부', () => {
    const data = { deadline: 'not-a-date' };

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('빈 문자열 거부', () => {
    const data = { deadline: '' };

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('deadline 필드 누락 거부', () => {
    const data = {};

    const result = UpdateCourseDeadlineSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

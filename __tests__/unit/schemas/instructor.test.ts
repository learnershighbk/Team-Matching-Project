/**
 * Instructor Zod 스키마 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  MatchCourseSchema,
} from '@/features/instructor/backend/schema';

describe('CreateCourseSchema', () => {
  describe('유효한 데이터', () => {
    it('모든 필수 필드가 올바른 경우 통과', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('최소 팀 크기 (2명) 허용', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 2,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('최대 팀 크기 (6명) 허용', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 6,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('courseName 검증', () => {
    it('빈 코스 이름 거부', () => {
      const data = {
        courseName: '',
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('코스 이름을 입력해주세요');
      }
    });

    it('200자 초과 코스 이름 거부', () => {
      const data = {
        courseName: 'A'.repeat(201),
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('코스 이름은 200자 이하여야 합니다');
      }
    });

    it('200자 코스 이름 허용', () => {
      const data = {
        courseName: 'A'.repeat(200),
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('courseCode 검증', () => {
    it('빈 코스 코드 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: '',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('20자 초과 코스 코드 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'A'.repeat(21),
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('teamSize 검증', () => {
    it('1명 팀 크기 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 1,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('팀 크기는 최소 2명이어야 합니다');
      }
    });

    it('7명 팀 크기 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 7,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('팀 크기는 최대 6명입니다');
      }
    });

    it('소수점 팀 크기 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 3.5,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('음수 팀 크기 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: -1,
        weightProfile: 'balanced',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('weightProfile 검증', () => {
    const validProfiles = [
      'balanced',
      'skill_heavy',
      'skill_role_focused',
      'diversity_heavy',
      'time_heavy',
    ];

    validProfiles.forEach((profile) => {
      it(`${profile} 허용`, () => {
        const data = {
          courseName: 'Test Course',
          courseCode: 'TC101',
          teamSize: 4,
          weightProfile: profile,
          deadline: '2024-12-31T23:59:59.000Z',
        };

        const result = CreateCourseSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 weightProfile 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'invalid_profile',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('deadline 검증', () => {
    it('유효한 ISO datetime 허용', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: new Date().toISOString(),
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('잘못된 날짜 형식 거부', () => {
      const data = {
        courseName: 'Test Course',
        courseCode: 'TC101',
        teamSize: 4,
        weightProfile: 'balanced',
        deadline: '2024-12-31',
      };

      const result = CreateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});

describe('UpdateCourseSchema', () => {
  describe('부분 업데이트', () => {
    it('courseName만 업데이트', () => {
      const data = { courseName: 'New Course Name' };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('courseCode만 업데이트', () => {
      const data = { courseCode: 'NEW101' };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('teamSize만 업데이트', () => {
      const data = { teamSize: 5 };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('weightProfile만 업데이트', () => {
      const data = { weightProfile: 'skill_heavy' };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('deadline만 업데이트', () => {
      const data = { deadline: new Date().toISOString() };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('빈 객체 허용', () => {
      const data = {};

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('여러 필드 동시 업데이트', () => {
      const data = {
        courseName: 'Updated Course',
        teamSize: 5,
        weightProfile: 'diversity_heavy',
      };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('검증 규칙', () => {
    it('잘못된 teamSize 거부', () => {
      const data = { teamSize: 10 };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('잘못된 weightProfile 거부', () => {
      const data = { weightProfile: 'invalid' };

      const result = UpdateCourseSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});

describe('MatchCourseSchema', () => {
  it('weightProfile 지정 허용', () => {
    const data = { weightProfile: 'skill_heavy' };

    const result = MatchCourseSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('빈 객체 허용 (기본 프로파일 사용)', () => {
    const data = {};

    const result = MatchCourseSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('잘못된 weightProfile 거부', () => {
    const data = { weightProfile: 'invalid_profile' };

    const result = MatchCourseSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('모든 유효한 weightProfile 허용', () => {
    const profiles = [
      'balanced',
      'skill_heavy',
      'skill_role_focused',
      'diversity_heavy',
      'time_heavy',
    ];

    profiles.forEach((profile) => {
      const data = { weightProfile: profile };
      const result = MatchCourseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

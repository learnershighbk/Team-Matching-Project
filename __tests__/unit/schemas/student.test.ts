/**
 * Student Zod 스키마 테스트
 */

import { describe, it, expect } from 'vitest';
import { UpdateProfileSchema } from '@/features/student/backend/schema';

describe('UpdateProfileSchema', () => {
  const validProfile = {
    name: 'Test Student',
    email: 'student@test.com',
    major: 'Master',
    gender: 'Male',
    continent: 'Asia',
    role: 'Member',
    skill: 'Intermediate',
    times: ['Morning'],
    goal: 'Learn',
  };

  describe('유효한 데이터', () => {
    it('모든 필드가 올바른 경우 통과', () => {
      const result = UpdateProfileSchema.safeParse(validProfile);

      expect(result.success).toBe(true);
    });

    it('여러 시간대 선택 허용', () => {
      const data = {
        ...validProfile,
        times: ['Morning', 'Afternoon', 'Evening'],
      };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('name 검증', () => {
    it('빈 이름 거부', () => {
      const data = { ...validProfile, name: '' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('이름을 입력해주세요');
      }
    });

    it('100자 초과 이름 거부', () => {
      const data = { ...validProfile, name: 'A'.repeat(101) };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('이름은 100자 이하여야 합니다');
      }
    });

    it('100자 이름 허용', () => {
      const data = { ...validProfile, name: 'A'.repeat(100) };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('email 검증', () => {
    it('유효한 이메일 허용', () => {
      const data = { ...validProfile, email: 'valid@email.com' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('잘못된 이메일 거부', () => {
      const data = { ...validProfile, email: 'invalid-email' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('올바른 이메일 형식이 아닙니다');
      }
    });

    it('빈 이메일 거부', () => {
      const data = { ...validProfile, email: '' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('major 검증', () => {
    const validMajors = ['Undergraduate', 'Master', 'PhD'];

    validMajors.forEach((major) => {
      it(`${major} 허용`, () => {
        const data = { ...validProfile, major };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 major 거부', () => {
      const data = { ...validProfile, major: 'Postdoc' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('gender 검증', () => {
    const validGenders = ['Male', 'Female', 'Other'];

    validGenders.forEach((gender) => {
      it(`${gender} 허용`, () => {
        const data = { ...validProfile, gender };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 gender 거부', () => {
      const data = { ...validProfile, gender: 'Unknown' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('continent 검증', () => {
    const validContinents = [
      'Asia',
      'Europe',
      'North America',
      'South America',
      'Africa',
      'Oceania',
    ];

    validContinents.forEach((continent) => {
      it(`${continent} 허용`, () => {
        const data = { ...validProfile, continent };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 continent 거부', () => {
      const data = { ...validProfile, continent: 'Antarctica' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('role 검증', () => {
    const validRoles = ['Leader', 'Member', 'Flexible'];

    validRoles.forEach((role) => {
      it(`${role} 허용`, () => {
        const data = { ...validProfile, role };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 role 거부', () => {
      const data = { ...validProfile, role: 'Manager' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('skill 검증', () => {
    const validSkills = ['Beginner', 'Intermediate', 'Advanced'];

    validSkills.forEach((skill) => {
      it(`${skill} 허용`, () => {
        const data = { ...validProfile, skill };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 skill 거부', () => {
      const data = { ...validProfile, skill: 'Expert' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('times 검증', () => {
    const validTimes = ['Morning', 'Afternoon', 'Evening'];

    it('단일 시간대 허용', () => {
      const data = { ...validProfile, times: ['Morning'] };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('두 개 시간대 허용', () => {
      const data = { ...validProfile, times: ['Morning', 'Evening'] };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('모든 시간대 선택 허용', () => {
      const data = { ...validProfile, times: validTimes };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('빈 배열 거부 (최소 1개 필요)', () => {
      const data = { ...validProfile, times: [] };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('최소 1개의 시간대를 선택해주세요');
      }
    });

    it('잘못된 시간대 거부', () => {
      const data = { ...validProfile, times: ['Night'] };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('유효한 시간대와 잘못된 시간대 혼합 거부', () => {
      const data = { ...validProfile, times: ['Morning', 'Midnight'] };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('goal 검증', () => {
    const validGoals = ['Learn', 'Complete', 'Excel'];

    validGoals.forEach((goal) => {
      it(`${goal} 허용`, () => {
        const data = { ...validProfile, goal };

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    it('잘못된 goal 거부', () => {
      const data = { ...validProfile, goal: 'Win' };

      const result = UpdateProfileSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('필수 필드 누락', () => {
    const requiredFields = [
      'name',
      'email',
      'major',
      'gender',
      'continent',
      'role',
      'skill',
      'times',
      'goal',
    ];

    requiredFields.forEach((field) => {
      it(`${field} 필드 누락 거부`, () => {
        const data = { ...validProfile };
        delete (data as Record<string, unknown>)[field];

        const result = UpdateProfileSchema.safeParse(data);

        expect(result.success).toBe(false);
      });
    });
  });
});

describe('프로필 시나리오', () => {
  it('모든 조합이 유효한 완전한 프로필', () => {
    const profiles = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        major: 'PhD',
        gender: 'Male',
        continent: 'North America',
        role: 'Leader',
        skill: 'Advanced',
        times: ['Morning', 'Afternoon'],
        goal: 'Excel',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        major: 'Undergraduate',
        gender: 'Female',
        continent: 'Europe',
        role: 'Member',
        skill: 'Beginner',
        times: ['Evening'],
        goal: 'Learn',
      },
      {
        name: 'Alex Kim',
        email: 'alex@example.com',
        major: 'Master',
        gender: 'Other',
        continent: 'Asia',
        role: 'Flexible',
        skill: 'Intermediate',
        times: ['Morning', 'Afternoon', 'Evening'],
        goal: 'Complete',
      },
    ];

    profiles.forEach((profile) => {
      const result = UpdateProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });
});

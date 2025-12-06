/**
 * 매칭 알고리즘 메인 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { runMatching } from '@/features/matching/algorithm';
import type { MatchingInput } from '@/features/matching/algorithm';

describe('runMatching', () => {
  it('최소 2명의 학생이 필요', () => {
    const input: MatchingInput = {
      students: [
        {
          studentId: '1',
          studentNumber: '123456789',
          name: '학생1',
          email: 'student1@test.com',
          major: 'Master',
          gender: 'Male',
          continent: 'Asia',
          role: 'Leader',
          skill: 'Intermediate',
          times: ['weekday_daytime'],
          goal: 'Learn',
        },
      ],
      teamSize: 4,
      weightProfile: 'balanced',
    };

    expect(() => runMatching(input)).toThrow('MATCH_001');
  });

  it('최소 2명의 프로필 완료 학생이 필요', () => {
    const input: MatchingInput = {
      students: [
        {
          studentId: '1',
          studentNumber: '123456789',
          name: '학생1',
        },
        {
          studentId: '2',
          studentNumber: '123456790',
        },
      ],
      teamSize: 4,
      weightProfile: 'balanced',
    };

    expect(() => runMatching(input)).toThrow('MATCH_001');
  });

  it('정상적인 매칭 실행', () => {
    const input: MatchingInput = {
      students: [
        {
          studentId: '1',
          studentNumber: '123456789',
          name: '학생1',
          email: 'student1@test.com',
          major: 'Master',
          gender: 'Male',
          continent: 'Asia',
          role: 'Leader',
          skill: 'Intermediate',
          times: ['weekday_daytime'],
          goal: 'Learn',
        },
        {
          studentId: '2',
          studentNumber: '123456790',
          name: '학생2',
          email: 'student2@test.com',
          major: 'PhD',
          gender: 'Female',
          continent: 'Europe',
          role: 'Member',
          skill: 'Advanced',
          times: ['weekday_daytime'],
          goal: 'Learn',
        },
        {
          studentId: '3',
          studentNumber: '123456791',
          name: '학생3',
          email: 'student3@test.com',
          major: 'Undergraduate',
          gender: 'Male',
          continent: 'North America',
          role: 'Flexible',
          skill: 'Beginner',
          times: ['weekday_daytime'],
          goal: 'Complete',
        },
        {
          studentId: '4',
          studentNumber: '123456792',
          name: '학생4',
          email: 'student4@test.com',
          major: 'Master',
          gender: 'Female',
          continent: 'Asia',
          role: 'Member',
          skill: 'Intermediate',
          times: ['weekday_daytime'],
          goal: 'Learn',
        },
      ],
      teamSize: 4,
      weightProfile: 'balanced',
    };

    const result = runMatching(input);

    expect(result.teams).toBeDefined();
    expect(result.teams.length).toBeGreaterThan(0);
    expect(result.summary).toBeDefined();
    expect(result.summary.teamCount).toBeGreaterThan(0);
    expect(result.summary.averageScore).toBeGreaterThanOrEqual(0);
  });

  it('팀 간 인원 차이 최대 1명 보장', () => {
    const input: MatchingInput = {
      students: Array.from({ length: 13 }, (_, i) => ({
        studentId: `${i + 1}`,
        studentNumber: `12345678${i}`,
        name: `학생${i + 1}`,
        email: `student${i + 1}@test.com`,
        major: 'Master',
        gender: 'Male',
        continent: 'Asia',
        role: 'Member',
        skill: 'Intermediate',
        times: ['weekday_daytime'],
        goal: 'Learn',
      })),
      teamSize: 4,
      weightProfile: 'balanced',
    };

    const result = runMatching(input);

    const teamSizes = result.teams.map(t => t.memberCount);
    const minSize = Math.min(...teamSizes);
    const maxSize = Math.max(...teamSizes);

    expect(maxSize - minSize).toBeLessThanOrEqual(1);
    expect(minSize).toBeGreaterThanOrEqual(2);
  });

  it('모든 학생이 팀에 배정됨', () => {
    const students = Array.from({ length: 10 }, (_, i) => ({
      studentId: `${i + 1}`,
      studentNumber: `12345678${i}`,
      name: `학생${i + 1}`,
      email: `student${i + 1}@test.com`,
      major: 'Master',
      gender: 'Male',
      continent: 'Asia',
      role: 'Member',
      skill: 'Intermediate',
      times: ['weekday_daytime'],
      goal: 'Learn',
    }));

    const input: MatchingInput = {
      students,
      teamSize: 4,
      weightProfile: 'balanced',
    };

    const result = runMatching(input);

    const totalAssigned = result.teams.reduce((sum, team) => sum + team.memberCount, 0);
    expect(totalAssigned).toBe(students.length);
  });
});


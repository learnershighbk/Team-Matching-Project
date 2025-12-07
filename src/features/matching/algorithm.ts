/**
 * 매칭 알고리즘 메인 로직
 * 
 * 참조: docs/MATCHING_ALGORITHM.md 섹션 5
 */

import type { Team, TeamMember } from './types';
import { createTeamSlots, type TeamSlot } from './slots';
import { calculateScores, type ScoreBreakdown } from './scoring';
import { optimizeTeams } from './optimizer';
import { getWeightProfile } from './weights';
import { normalizeTopFactors } from './utils';

export type MatchingInput = {
  students: Array<{
    studentId: string;
    studentNumber: string;
    name?: string;
    email?: string;
    major?: string;
    gender?: string;
    continent?: string;
    role?: string;
    skill?: string;
    times?: string[];
    goal?: string;
  }>;
  teamSize: number;
  weightProfile: string;
};

export type MatchingResult = {
  teams: Team[];
  summary: {
    teamCount: number;
    averageScore: number;
    scoreStdDev: number;
    minScore: number;
    maxScore: number;
  };
};

/**
 * 매칭 실행
 * 
 * @param input 매칭 입력 데이터
 * @returns 매칭 결과
 */
export function runMatching(input: MatchingInput): MatchingResult {
  const { students, teamSize, weightProfile } = input;

  // 1. Validation
  if (students.length < 2) {
    throw new Error('MATCH_001: 최소 2명의 학생이 필요합니다');
  }

  // 프로필 완료 학생만 필터링
  const completedStudents = students.filter(s => 
    s.name && s.email && s.major && s.gender && s.continent && 
    s.role && s.skill && s.times && s.times.length > 0 && s.goal
  );

  if (completedStudents.length < 2) {
    throw new Error('MATCH_001: 최소 2명의 프로필 완료 학생이 필요합니다');
  }

  // 2. Preparation
  // 랜덤 셔플 (Fisher-Yates)
  const shuffled = shuffle([...completedStudents]);

  // 팀 슬롯 생성
  const slots = createTeamSlots(shuffled.length, teamSize);

  // 3. Initial Assignment
  let teams = initialAssignment(shuffled, slots);

  // 4. Optimization
  teams = optimizeTeams(teams, weightProfile);

  // 5. Finalization
  return finalizeResult(teams, weightProfile);
}

/**
 * 초기 배정
 */
function initialAssignment(
  students: MatchingInput['students'],
  slots: TeamSlot[]
): Team[] {
  const teams: Team[] = slots.map(slot => ({
    teamId: '', // 나중에 DB 저장 시 생성
    courseId: '', // 나중에 설정
    teamNumber: slot.teamNumber,
    memberCount: 0,
    members: [],
  }));

  let studentIndex = 0;

  for (const slot of slots) {
    for (let i = 0; i < slot.capacity; i++) {
      if (studentIndex < students.length) {
        const student = students[studentIndex];
        teams[slot.teamNumber - 1].members.push({
          studentId: student.studentId,
          studentNumber: student.studentNumber,
          name: student.name,
          email: student.email,
          major: student.major,
          gender: student.gender,
          continent: student.continent,
          role: student.role,
          skill: student.skill,
          times: student.times,
          goal: student.goal,
        });
        teams[slot.teamNumber - 1].memberCount++;
        studentIndex++;
      }
    }
  }

  return teams;
}

/**
 * 결과 마무리
 */
function finalizeResult(
  teams: Team[],
  weightProfile: string
): MatchingResult {
  const weights = getWeightProfile(weightProfile);

  // 각 팀의 점수 계산 및 Top Factors 추출
  const teamsWithScores = teams.map(team => {
    const scores = calculateScores(team.members.map(m => m as TeamMember));
    const totalScore = calculateTotalScore(scores, weights);
    const topFactors = extractTopFactors(scores, weights);

    return {
      ...team,
      scores,
      totalScore,
      topFactors: normalizeTopFactors([topFactors[0], topFactors[1]]),
    };
  });

  // 통계 계산
  const scores = teamsWithScores.map(t => t.totalScore);
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const variance = scores.length > 0
    ? scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length
    : 0;
  const stdDev = Math.sqrt(variance);

  return {
    teams: teamsWithScores.map(t => ({
      ...t,
      topFactors: t.topFactors || [],
    })),
    summary: {
      teamCount: teamsWithScores.length,
      averageScore: Math.round(avgScore * 100) / 100,
      scoreStdDev: Math.round(stdDev * 100) / 100,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    },
  };
}

/**
 * 가중치 적용 총점 계산
 */
function calculateTotalScore(
  scores: ScoreBreakdown,
  weights: ReturnType<typeof getWeightProfile>
): number {
  return (
    scores.time * weights.time +
    scores.skill * weights.skill +
    scores.role * weights.role +
    scores.major * weights.major +
    scores.goal * weights.goal +
    scores.continent * weights.continent +
    scores.gender * weights.gender
  );
}

/**
 * Top Factors 추출
 */
function extractTopFactors(
  scores: ScoreBreakdown,
  weights: ReturnType<typeof getWeightProfile>
): [string, string] {
  const weightedScores = Object.entries(scores).map(([key, value]) => ({
    factor: key,
    weightedScore: value * weights[key as keyof typeof weights],
  }));

  // 상위 2개 추출
  weightedScores.sort((a, b) => b.weightedScore - a.weightedScore);

  return [
    weightedScores[0]?.factor || 'time',
    weightedScores[1]?.factor || 'skill',
  ];
}

/**
 * Fisher-Yates 셔플
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


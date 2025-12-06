/**
 * 매칭 점수 계산 로직
 * 
 * 7개 점수 계산 규칙:
 * 1. Time Score (시간대 일치)
 * 2. Skill Score (기술 수준 다양성)
 * 3. Role Score (역할 균형)
 * 4. Major Score (전공 다양성)
 * 5. Goal Score (목표 일치)
 * 6. Continent Score (대륙 다양성)
 * 7. Gender Score (성별 균형)
 * 
 * 참조: docs/MATCHING_ALGORITHM.md 섹션 3
 */

import type { TeamMember } from './types';

export type ScoreBreakdown = {
  time: number;
  skill: number;
  role: number;
  major: number;
  goal: number;
  continent: number;
  gender: number;
};

/**
 * 모든 점수 계산
 */
export function calculateScores(members: TeamMember[]): ScoreBreakdown {
  return {
    time: calculateTimeScore(members),
    skill: calculateSkillScore(members),
    role: calculateRoleScore(members),
    major: calculateMajorScore(members),
    goal: calculateGoalScore(members),
    continent: calculateContinentScore(members),
    gender: calculateGenderScore(members),
  };
}

/**
 * 시간대 일치 점수 계산
 * 
 * 조건:
 * - 전원 일치 시간대 1개+ → 10점
 * - 과반수 일치 → 6점
 * - 그 외 → 2점
 */
export function calculateTimeScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const memberCount = members.length;
  const majority = Math.ceil(memberCount / 2);
  
  // 각 시간대별 선택 인원 수
  const timeSlots = ['weekday_daytime', 'weekday_evening', 'weekend'];
  
  // 전원 일치 확인
  for (const slot of timeSlots) {
    const count = members.filter(m => m.times?.includes(slot)).length;
    
    if (count === memberCount) {
      return 10;
    }
  }
  
  // 과반수 일치 확인
  for (const slot of timeSlots) {
    const count = members.filter(m => m.times?.includes(slot)).length;
    if (count >= majority) {
      return 6;
    }
  }
  
  return 2;
}

/**
 * 기술 수준 다양성 점수 계산
 * 
 * 조건:
 * - 5가지 모두 보유 → 10점
 * - 4가지 → 8점
 * - 3가지 → 6점
 * - 2가지 이하 → 3점
 */
export function calculateSkillScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const skills = new Set(members.map(m => m.skill).filter(Boolean));
  const uniqueCount = skills.size;
  
  if (uniqueCount >= 5) return 10;
  if (uniqueCount === 4) return 8;
  if (uniqueCount === 3) return 6;
  return 3;
}

/**
 * 역할 균형 점수 계산
 * 
 * 조건:
 * - 4가지 역할 모두 → 10점
 * - 3가지 → 7점
 * - 2가지 → 4점
 * - 1가지 → 1점
 */
export function calculateRoleScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const roles = new Set(members.map(m => m.role).filter(Boolean));
  const uniqueCount = roles.size;
  
  if (uniqueCount >= 4) return 10;
  if (uniqueCount === 3) return 7;
  if (uniqueCount === 2) return 4;
  return 1;
}

/**
 * 전공 다양성 점수 계산
 * 
 * 조건:
 * - 3개+ 전공 → 10점
 * - 2개 전공 → 6점
 * - 단일 전공 → 2점
 */
export function calculateMajorScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const majors = new Set(members.map(m => m.major).filter(Boolean));
  const uniqueCount = majors.size;
  
  if (uniqueCount >= 3) return 10;
  if (uniqueCount === 2) return 6;
  return 2;
}

/**
 * 목표 일치 점수 계산
 * 
 * 조건:
 * - 전원 동일 → 10점
 * - 1명 다름 → 7점
 * - 2명+ 다름 → 3점
 */
export function calculateGoalScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const goals = members.map(m => m.goal).filter(Boolean);
  if (goals.length === 0) return 0;
  
  const goalCounts = new Map<string, number>();
  
  goals.forEach(g => {
    goalCounts.set(g, (goalCounts.get(g) || 0) + 1);
  });
  
  const maxCount = Math.max(...goalCounts.values());
  const differentCount = members.length - maxCount;
  
  if (differentCount === 0) return 10;
  if (differentCount === 1) return 7;
  return 3;
}

/**
 * 대륙 다양성 점수 계산
 * 
 * 조건:
 * - 3개+ 대륙 → 10점
 * - 2개 대륙 → 6점
 * - 단일 대륙 → 2점
 */
export function calculateContinentScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const continents = new Set(members.map(m => m.continent).filter(Boolean));
  const uniqueCount = continents.size;
  
  if (uniqueCount >= 3) return 10;
  if (uniqueCount === 2) return 6;
  return 2;
}

/**
 * 성별 균형 점수 계산
 * 
 * 조건:
 * - 혼합 (2개+ 성별) → 10점
 * - 단일 성별 → 3점
 */
export function calculateGenderScore(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const genders = new Set(members.map(m => m.gender).filter(Boolean));
  return genders.size >= 2 ? 10 : 3;
}


/**
 * Local Swap 최적화 알고리즘
 * 
 * 참조: docs/MATCHING_ALGORITHM.md 섹션 5.4
 */

import type { Team, TeamMember } from './types';
import { calculateScores } from './scoring';
import { getWeightProfile } from './weights';
import type { ScoreBreakdown } from './scoring';

/**
 * 팀 최적화 (Local Swap)
 * 
 * 팀 간 멤버 스왑을 통해 총점을 개선합니다.
 * 
 * @param teams 초기 팀 구성
 * @param weightProfile 가중치 프로파일
 * @param maxIterations 최대 반복 횟수
 * @returns 최적화된 팀 구성
 */
export function optimizeTeams(
  teams: Team[],
  weightProfile: string,
  maxIterations = 1000
): Team[] {
  if (teams.length < 2) {
    return teams;
  }

  const weights = getWeightProfile(weightProfile);
  
  // 초기 점수 계산
  const teamsWithScores = teams.map(team => ({
    ...team,
    scores: calculateScores(team.members.map(m => m as TeamMember)),
    totalScore: calculateTotalScore(
      calculateScores(team.members.map(m => m as TeamMember)),
      weights
    ),
  }));

  let improved = true;
  let iterations = 0;
  const EARLY_STOP_THRESHOLD = 0.001; // 개선률이 0.1% 미만이면 종료

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    let bestImprovement = 0;
    let bestSwap: {
      team1Index: number;
      team2Index: number;
      member1Index: number;
      member2Index: number;
    } | null = null;
    
    // 모든 팀 쌍에 대해 스왑 시도
    for (let i = 0; i < teamsWithScores.length; i++) {
      for (let j = i + 1; j < teamsWithScores.length; j++) {
        const swapResult = trySwap(
          teamsWithScores[i],
          teamsWithScores[j],
          weights
        );
        
        if (swapResult.improvement > bestImprovement) {
          bestImprovement = swapResult.improvement;
          bestSwap = {
            team1Index: i,
            team2Index: j,
            member1Index: swapResult.member1Index,
            member2Index: swapResult.member2Index,
          };
        }
      }
    }
    
    // 개선이 있는 경우 스왑 수행
    if (bestSwap && bestImprovement > EARLY_STOP_THRESHOLD) {
      const { team1Index, team2Index, member1Index, member2Index } = bestSwap;
      
      // 멤버 스왑
      const team1 = teamsWithScores[team1Index];
      const team2 = teamsWithScores[team2Index];
      
      const [member1, member2] = [
        team1.members[member1Index],
        team2.members[member2Index],
      ];
      
      // 스왑 수행
      const newTeam1Members = [...team1.members];
      const newTeam2Members = [...team2.members];
      newTeam1Members[member1Index] = member2;
      newTeam2Members[member2Index] = member1;
      
      // 새 점수 계산
      const newScores1 = calculateScores(newTeam1Members.map(m => m as TeamMember));
      const newScores2 = calculateScores(newTeam2Members.map(m => m as TeamMember));
      const newTotal1 = calculateTotalScore(newScores1, weights);
      const newTotal2 = calculateTotalScore(newScores2, weights);
      
      // 팀 업데이트
      teamsWithScores[team1Index] = {
        ...team1,
        members: newTeam1Members,
        scores: newScores1,
        totalScore: newTotal1,
      };
      
      teamsWithScores[team2Index] = {
        ...team2,
        members: newTeam2Members,
        scores: newScores2,
        totalScore: newTotal2,
      };
      
      improved = true;
    }
  }
  
  return teamsWithScores;
}

interface SwapResult {
  improvement: number;
  member1Index: number;
  member2Index: number;
}

/**
 * 두 팀 간 스왑 시도
 */
function trySwap(
  team1: Team & { scores: ScoreBreakdown; totalScore: number },
  team2: Team & { scores: ScoreBreakdown; totalScore: number },
  weights: ReturnType<typeof getWeightProfile>
): SwapResult {
  const currentTotal = team1.totalScore + team2.totalScore;
  
  let bestImprovement = 0;
  let bestMember1Index = 0;
  let bestMember2Index = 0;
  
  // 각 멤버 쌍에 대해 스왑 시도
  for (let m1 = 0; m1 < team1.members.length; m1++) {
    for (let m2 = 0; m2 < team2.members.length; m2++) {
      // 스왑 수행
      const newTeam1Members = [...team1.members];
      const newTeam2Members = [...team2.members];
      
      [newTeam1Members[m1], newTeam2Members[m2]] = 
        [newTeam2Members[m2], newTeam1Members[m1]];
      
      // 새 점수 계산
      const newScores1 = calculateScores(newTeam1Members.map(m => m as TeamMember));
      const newScores2 = calculateScores(newTeam2Members.map(m => m as TeamMember));
      const newTotal1 = calculateTotalScore(newScores1, weights);
      const newTotal2 = calculateTotalScore(newScores2, weights);
      
      const newTotal = newTotal1 + newTotal2;
      const improvement = newTotal - currentTotal;
      
      // 점수 향상 시 채택
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestMember1Index = m1;
        bestMember2Index = m2;
      }
    }
  }
  
  return {
    improvement: bestImprovement,
    member1Index: bestMember1Index,
    member2Index: bestMember2Index,
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


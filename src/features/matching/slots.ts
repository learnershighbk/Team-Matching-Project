/**
 * 팀 슬롯 생성 로직
 * 
 * 낙오자 방지: 팀 간 인원 차이 최대 1명 보장
 */

export type TeamSlot = {
  teamNumber: number;
  targetSize: number;
  currentSize: number;
};

/**
 * 팀 슬롯 생성
 * 
 * @param studentCount 학생 수
 * @param targetTeamSize 목표 팀 크기
 * @returns 팀 슬롯 배열
 */
export function createTeamSlots(
  studentCount: number,
  targetTeamSize: number
): TeamSlot[] {
  // TODO: Implementation will be added in Phase 3
  // 팀 간 인원 차이 최대 1명 보장
  throw new Error('Not implemented');
}


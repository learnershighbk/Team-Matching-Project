/**
 * 팀 슬롯 생성 로직
 * 
 * 낙오자 방지: 팀 간 인원 차이 최대 1명 보장
 * 
 * 참조: docs/MATCHING_ALGORITHM.md 섹션 2
 */

export type TeamSlot = {
  teamNumber: number;
  capacity: number;
};

/**
 * 팀 슬롯 생성
 * 
 * 팀 간 인원 차이는 최대 1명을 보장합니다.
 * 예: 13명, team_size=4 → 4+3+3+3 (1명 팀 방지)
 * 
 * @param studentCount 학생 수
 * @param targetTeamSize 목표 팀 크기
 * @returns 팀 슬롯 배열
 */
export function createTeamSlots(
  studentCount: number,
  targetTeamSize: number
): TeamSlot[] {
  if (studentCount < 2) {
    throw new Error('최소 2명의 학생이 필요합니다');
  }

  if (targetTeamSize < 2) {
    throw new Error('목표 팀 크기는 최소 2명이어야 합니다');
  }

  // 최소 팀 수 계산 (올림)
  const teamCount = Math.ceil(studentCount / targetTeamSize);
  
  // 기본 인원 (내림)
  const baseSize = Math.floor(studentCount / teamCount);
  
  // 추가 인원이 필요한 팀 수
  const extraTeams = studentCount % teamCount;
  
  const slots: TeamSlot[] = [];
  
  for (let i = 0; i < teamCount; i++) {
    slots.push({
      teamNumber: i + 1,
      // 앞쪽 팀부터 +1명 배정
      capacity: i < extraTeams ? baseSize + 1 : baseSize,
    });
  }
  
  // 검증: 모든 슬롯이 최소 2명 이상인지 확인
  const minCapacity = Math.min(...slots.map(s => s.capacity));
  if (minCapacity < 2) {
    throw new Error('팀 슬롯 생성 실패: 1명 팀이 생성될 수 없습니다');
  }
  
  // 검증: 총 인원이 일치하는지 확인
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  if (totalCapacity !== studentCount) {
    throw new Error(`팀 슬롯 생성 실패: 총 인원 불일치 (예상: ${studentCount}, 실제: ${totalCapacity})`);
  }
  
  return slots;
}


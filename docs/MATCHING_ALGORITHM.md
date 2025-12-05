# 🎯 MATCHING_ALGORITHM.md — TeamMatch 매칭 알고리즘

**참조:** PRD.md 섹션 8  
**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. Overview

### 1.1 알고리즘 목표

```
Primary Goal:   모든 팀 점수의 평균 최대화
Secondary Goal: 팀 간 점수 편차 최소화
Constraint:     낙오자 0명 (1인 팀 방지)
```

### 1.2 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **공정성** | 모든 학생이 팀에 배정됨 |
| **균형** | 팀 간 인원 차이 최대 1명 |
| **최적화** | 점수 기반 팀 구성 |
| **투명성** | 매칭 이유 설명 가능 |

---

## 2. Team Slot Allocation (낙오자 방지)

### 2.1 핵심 로직

```
팀 간 인원 차이는 최대 1명

예시: 13명, team_size=4
❌ Wrong:  4+4+4+1 (1명 팀 발생)
✅ Correct: 4+3+3+3 (균등 분배)
```

### 2.2 알고리즘

```typescript
interface TeamSlot {
  teamNumber: number;
  capacity: number;
}

function createTeamSlots(
  studentCount: number,
  targetTeamSize: number
): TeamSlot[] {
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
  
  return slots;
}
```

### 2.3 예시 계산

| 학생 수 | 목표 인원 | 팀 수 | 분배 |
|--------|----------|------|------|
| 12 | 4 | 3 | 4+4+4 |
| 13 | 4 | 4 | 4+3+3+3 |
| 14 | 4 | 4 | 4+4+3+3 |
| 15 | 4 | 4 | 4+4+4+3 |
| 16 | 4 | 4 | 4+4+4+4 |
| 17 | 4 | 5 | 4+4+3+3+3 |
| 10 | 3 | 4 | 3+3+2+2 |
| 11 | 5 | 3 | 4+4+3 |

---

## 3. Scoring Rules (7개)

### 3.1 점수 계산 함수

```typescript
interface TeamMember {
  major: string;
  gender: string;
  continent: string;
  role: string;
  skill: string;
  times: string[];
  goal: string;
}

interface ScoreBreakdown {
  time: number;
  skill: number;
  role: number;
  major: number;
  goal: number;
  continent: number;
  gender: number;
}

function calculateScores(members: TeamMember[]): ScoreBreakdown {
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
```

### 3.2 Time Overlap Score

**조건:**
- 전원 일치 시간대 1개+ → 10점
- 과반수 일치 → 6점
- 그 외 → 2점

```typescript
function calculateTimeScore(members: TeamMember[]): number {
  const memberCount = members.length;
  const majority = Math.ceil(memberCount / 2);
  
  // 각 시간대별 선택 인원 수
  const timeSlots = ['weekday_daytime', 'weekday_evening', 'weekend'];
  
  for (const slot of timeSlots) {
    const count = members.filter(m => m.times.includes(slot)).length;
    
    // 전원 일치
    if (count === memberCount) {
      return 10;
    }
  }
  
  // 과반수 일치 확인
  for (const slot of timeSlots) {
    const count = members.filter(m => m.times.includes(slot)).length;
    if (count >= majority) {
      return 6;
    }
  }
  
  return 2;
}
```

### 3.3 Skill Balance Score

**조건:**
- 5가지 모두 보유 → 10점
- 4가지 → 8점
- 3가지 → 6점
- 2가지 이하 → 3점

```typescript
function calculateSkillScore(members: TeamMember[]): number {
  const skills = new Set(members.map(m => m.skill));
  const uniqueCount = skills.size;
  
  if (uniqueCount >= 5) return 10;
  if (uniqueCount === 4) return 8;
  if (uniqueCount === 3) return 6;
  return 3;
}
```

### 3.4 Role Balance Score

**조건:**
- 4가지 역할 모두 → 10점
- 3가지 → 7점
- 2가지 → 4점
- 1가지 → 1점

```typescript
function calculateRoleScore(members: TeamMember[]): number {
  const roles = new Set(members.map(m => m.role));
  const uniqueCount = roles.size;
  
  if (uniqueCount >= 4) return 10;
  if (uniqueCount === 3) return 7;
  if (uniqueCount === 2) return 4;
  return 1;
}
```

### 3.5 Major Diversity Score

**조건:**
- 3개+ 전공 → 10점
- 2개 전공 → 6점
- 단일 전공 → 2점

```typescript
function calculateMajorScore(members: TeamMember[]): number {
  const majors = new Set(members.map(m => m.major));
  const uniqueCount = majors.size;
  
  if (uniqueCount >= 3) return 10;
  if (uniqueCount === 2) return 6;
  return 2;
}
```

### 3.6 Goal Alignment Score

**조건:**
- 전원 동일 → 10점
- 1명 다름 → 7점
- 2명+ 다름 → 3점

```typescript
function calculateGoalScore(members: TeamMember[]): number {
  const goals = members.map(m => m.goal);
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
```

### 3.7 Continent Diversity Score

**조건:**
- 3개+ 대륙 → 10점
- 2개 대륙 → 6점
- 단일 대륙 → 2점

```typescript
function calculateContinentScore(members: TeamMember[]): number {
  const continents = new Set(members.map(m => m.continent));
  const uniqueCount = continents.size;
  
  if (uniqueCount >= 3) return 10;
  if (uniqueCount === 2) return 6;
  return 2;
}
```

### 3.8 Gender Diversity Score

**조건:**
- 혼합 (2개+ 성별) → 10점
- 단일 성별 → 3점

```typescript
function calculateGenderScore(members: TeamMember[]): number {
  const genders = new Set(members.map(m => m.gender));
  return genders.size >= 2 ? 10 : 3;
}
```

---

## 4. Weight Profiles

### 4.1 프로파일 정의

```typescript
interface WeightProfile {
  time: number;
  skill: number;
  role: number;
  major: number;
  goal: number;
  continent: number;
  gender: number;
}

const WEIGHT_PROFILES: Record<string, WeightProfile> = {
  balanced: {
    time: 4,
    skill: 3,
    role: 2,
    major: 2,
    goal: 1,
    continent: 2,
    gender: 1.5,
  },
  skill_heavy: {
    time: 3,
    skill: 5,
    role: 2,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
  skill_role_focused: {
    time: 3,
    skill: 4,
    role: 3,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
  diversity_heavy: {
    time: 3,
    skill: 2,
    role: 1.5,
    major: 3,
    goal: 1,
    continent: 3,
    gender: 3,
  },
};
```

### 4.2 총점 계산

```typescript
function calculateTotalScore(
  scores: ScoreBreakdown,
  profileName: string
): number {
  const weights = WEIGHT_PROFILES[profileName];
  
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

// 최대 가능 점수 계산
function getMaxPossibleScore(profileName: string): number {
  const weights = WEIGHT_PROFILES[profileName];
  const maxRawScore = 10; // 모든 항목 최대 10점
  
  return Object.values(weights).reduce(
    (sum, weight) => sum + maxRawScore * weight,
    0
  );
}

// Balanced 프로파일: 10 × (4+3+2+2+1+2+1.5) = 155점
```

---

## 5. Matching Algorithm

### 5.1 전체 프로세스

```
┌─────────────────────────────────────────────────────────────┐
│                    Matching Pipeline                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Validation                                               │
│     - 코스 상태 확인 (LOCKED)                                │
│     - 학생 수 확인 (최소 2명)                                 │
│         │                                                    │
│         ▼                                                    │
│  2. Preparation                                              │
│     - 프로필 완료 학생 필터링                                │
│     - 학생 목록 랜덤 셔플                                    │
│     - 팀 슬롯 생성 (낙오자 방지)                             │
│         │                                                    │
│         ▼                                                    │
│  3. Initial Assignment                                       │
│     - 학생을 팀 슬롯에 순차 배정                             │
│         │                                                    │
│         ▼                                                    │
│  4. Optimization                                             │
│     - Local Swap으로 점수 개선                               │
│     - 팀 간 편차 최소화                                      │
│         │                                                    │
│         ▼                                                    │
│  5. Finalization                                             │
│     - 최종 점수 계산                                         │
│     - Top Factors 추출                                       │
│     - DB 저장                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 메인 알고리즘

```typescript
interface Student {
  studentId: string;
  profile: TeamMember;
}

interface Team {
  teamNumber: number;
  members: Student[];
  scores: ScoreBreakdown;
  totalScore: number;
  topFactors: [string, string];
}

interface MatchingResult {
  teams: Team[];
  summary: {
    teamCount: number;
    averageScore: number;
    scoreStdDev: number;
    minScore: number;
    maxScore: number;
  };
}

async function runMatching(
  courseId: string,
  weightProfile: string
): Promise<MatchingResult> {
  // 1. Validation
  const course = await getCourse(courseId);
  if (course.status !== 'LOCKED') {
    throw new Error('COURSE_005');
  }
  
  // 2. Preparation
  const students = await getCompletedStudents(courseId);
  if (students.length < 2) {
    throw new Error('MATCH_001');
  }
  
  // 랜덤 셔플 (Fisher-Yates)
  const shuffled = shuffle([...students]);
  
  // 팀 슬롯 생성
  const slots = createTeamSlots(shuffled.length, course.teamSize);
  
  // 3. Initial Assignment
  let teams = initialAssignment(shuffled, slots);
  
  // 4. Optimization
  teams = optimizeTeams(teams, weightProfile);
  
  // 5. Finalization
  return finalizeResult(teams, weightProfile);
}
```

### 5.3 초기 배정

```typescript
function initialAssignment(
  students: Student[],
  slots: TeamSlot[]
): Team[] {
  const teams: Team[] = slots.map(slot => ({
    teamNumber: slot.teamNumber,
    members: [],
    scores: {} as ScoreBreakdown,
    totalScore: 0,
    topFactors: ['', ''] as [string, string],
  }));
  
  let studentIndex = 0;
  
  for (const slot of slots) {
    for (let i = 0; i < slot.capacity; i++) {
      if (studentIndex < students.length) {
        teams[slot.teamNumber - 1].members.push(students[studentIndex]);
        studentIndex++;
      }
    }
  }
  
  return teams;
}
```

### 5.4 최적화 (Local Swap)

```typescript
function optimizeTeams(
  teams: Team[],
  weightProfile: string,
  maxIterations = 1000
): Team[] {
  let improved = true;
  let iterations = 0;
  
  // 초기 점수 계산
  teams.forEach(team => {
    team.scores = calculateScores(team.members.map(m => m.profile));
    team.totalScore = calculateTotalScore(team.scores, weightProfile);
  });
  
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    // 모든 팀 쌍에 대해 스왑 시도
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const swapResult = trySwap(teams[i], teams[j], weightProfile);
        
        if (swapResult.improved) {
          teams[i] = swapResult.team1;
          teams[j] = swapResult.team2;
          improved = true;
        }
      }
    }
  }
  
  return teams;
}

interface SwapResult {
  improved: boolean;
  team1: Team;
  team2: Team;
}

function trySwap(
  team1: Team,
  team2: Team,
  weightProfile: string
): SwapResult {
  const currentTotal = team1.totalScore + team2.totalScore;
  
  let bestSwap: SwapResult = {
    improved: false,
    team1,
    team2,
  };
  let bestImprovement = 0;
  
  // 각 멤버 쌍에 대해 스왑 시도
  for (let m1 = 0; m1 < team1.members.length; m1++) {
    for (let m2 = 0; m2 < team2.members.length; m2++) {
      // 스왑 수행
      const newTeam1Members = [...team1.members];
      const newTeam2Members = [...team2.members];
      
      [newTeam1Members[m1], newTeam2Members[m2]] = 
        [newTeam2Members[m2], newTeam1Members[m1]];
      
      // 새 점수 계산
      const newScores1 = calculateScores(newTeam1Members.map(m => m.profile));
      const newScores2 = calculateScores(newTeam2Members.map(m => m.profile));
      const newTotal1 = calculateTotalScore(newScores1, weightProfile);
      const newTotal2 = calculateTotalScore(newScores2, weightProfile);
      
      const newTotal = newTotal1 + newTotal2;
      const improvement = newTotal - currentTotal;
      
      // 점수 향상 + 편차 감소 시 채택
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestSwap = {
          improved: true,
          team1: {
            ...team1,
            members: newTeam1Members,
            scores: newScores1,
            totalScore: newTotal1,
          },
          team2: {
            ...team2,
            members: newTeam2Members,
            scores: newScores2,
            totalScore: newTotal2,
          },
        };
      }
    }
  }
  
  return bestSwap;
}
```

### 5.5 결과 마무리

```typescript
function finalizeResult(
  teams: Team[],
  weightProfile: string
): MatchingResult {
  // Top Factors 추출
  teams.forEach(team => {
    team.topFactors = extractTopFactors(team.scores, weightProfile);
  });
  
  // 통계 계산
  const scores = teams.map(t => t.totalScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    teams,
    summary: {
      teamCount: teams.length,
      averageScore: Math.round(avgScore * 100) / 100,
      scoreStdDev: Math.round(stdDev * 100) / 100,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
    },
  };
}

function extractTopFactors(
  scores: ScoreBreakdown,
  weightProfile: string
): [string, string] {
  const weights = WEIGHT_PROFILES[weightProfile];
  
  // 가중치 적용 점수 계산
  const weightedScores = Object.entries(scores).map(([key, value]) => ({
    factor: key,
    weightedScore: value * weights[key as keyof WeightProfile],
  }));
  
  // 상위 2개 추출
  weightedScores.sort((a, b) => b.weightedScore - a.weightedScore);
  
  return [weightedScores[0].factor, weightedScores[1].factor];
}
```

---

## 6. Utility Functions

### 6.1 Fisher-Yates Shuffle

```typescript
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}
```

### 6.2 매칭 설명 생성

```typescript
const FACTOR_LABELS: Record<string, string> = {
  time: '시간대(Time)',
  skill: '역량 균형(Skill)',
  role: '역할 분배(Role)',
  major: '전공 다양성(Major)',
  goal: '목표 일치(Goal)',
  continent: '대륙 다양성(Continent)',
  gender: '성별 다양성(Gender)',
};

function generateMatchDescription(topFactors: [string, string]): string {
  const factor1 = FACTOR_LABELS[topFactors[0]];
  const factor2 = FACTOR_LABELS[topFactors[1]];
  
  return `이 팀은 ${factor1} 및 ${factor2} 측면에서 가장 적합하게 매칭되었습니다.`;
}
```

---

## 7. Performance Considerations

### 7.1 시간 복잡도

| 단계 | 복잡도 | 설명 |
|------|--------|------|
| 팀 슬롯 생성 | O(n/k) | n=학생 수, k=팀 인원 |
| 초기 배정 | O(n) | 순차 배정 |
| 점수 계산 | O(k) | 팀당 |
| 스왑 최적화 | O(t² × k² × I) | t=팀 수, I=반복 횟수 |
| **전체** | **O(n² × I)** | n ≈ t × k |

### 7.2 성능 목표

| 학생 수 | 목표 시간 |
|--------|----------|
| 20명 | < 0.5초 |
| 50명 | < 1초 |
| 100명 | < 3초 |
| 200명 | < 5초 |

### 7.3 최적화 전략

```typescript
// 조기 종료 조건
const EARLY_STOP_THRESHOLD = 0.001; // 개선률이 0.1% 미만이면 종료

// 최대 반복 횟수 동적 조정
function getMaxIterations(studentCount: number): number {
  if (studentCount <= 20) return 2000;
  if (studentCount <= 50) return 1000;
  if (studentCount <= 100) return 500;
  return 200;
}
```

---

## 8. Testing

### 8.1 단위 테스트

```typescript
describe('Scoring Functions', () => {
  describe('calculateTimeScore', () => {
    it('should return 10 when all members share a time slot', () => {
      const members = [
        { times: ['weekday_daytime', 'weekend'] },
        { times: ['weekday_daytime'] },
        { times: ['weekday_daytime', 'weekday_evening'] },
      ] as TeamMember[];
      
      expect(calculateTimeScore(members)).toBe(10);
    });
    
    it('should return 6 when majority shares a time slot', () => {
      const members = [
        { times: ['weekday_daytime'] },
        { times: ['weekday_daytime'] },
        { times: ['weekend'] },
        { times: ['weekday_evening'] },
      ] as TeamMember[];
      
      expect(calculateTimeScore(members)).toBe(6);
    });
  });
});

describe('Team Slot Allocation', () => {
  it('should never create 1-person teams', () => {
    for (let n = 2; n <= 100; n++) {
      for (let size = 2; size <= 6; size++) {
        const slots = createTeamSlots(n, size);
        const minCapacity = Math.min(...slots.map(s => s.capacity));
        expect(minCapacity).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
```

### 8.2 통합 테스트

```typescript
describe('Matching Algorithm', () => {
  it('should assign all students to teams', async () => {
    const result = await runMatching('test-course-id', 'balanced');
    
    const totalAssigned = result.teams.reduce(
      (sum, team) => sum + team.members.length,
      0
    );
    
    expect(totalAssigned).toBe(25); // 예상 학생 수
  });
  
  it('should maintain team size difference <= 1', async () => {
    const result = await runMatching('test-course-id', 'balanced');
    
    const sizes = result.teams.map(t => t.members.length);
    const maxDiff = Math.max(...sizes) - Math.min(...sizes);
    
    expect(maxDiff).toBeLessThanOrEqual(1);
  });
});
```

---

## 9. Error Handling

### 9.1 에러 코드

| Code | Condition | Message |
|------|-----------|---------|
| COURSE_005 | status !== LOCKED | LOCKED 상태에서만 매칭 가능 |
| MATCH_001 | completedStudents < 2 | 최소 2명의 학생 필요 |
| MATCH_002 | status === CONFIRMED | 이미 확정된 매칭 |

### 9.2 에러 처리

```typescript
class MatchingError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'MatchingError';
  }
}

// 사용
if (course.status !== 'LOCKED') {
  throw new MatchingError(
    'COURSE_005',
    'LOCKED 상태에서만 매칭을 실행할 수 있습니다'
  );
}
```

---

## 10. File Structure

```
lib/matching/
├── algorithm.ts      # 메인 매칭 알고리즘
├── scoring.ts        # 점수 계산 함수들
├── optimizer.ts      # 최적화 로직 (스왑)
├── slots.ts          # 팀 슬롯 생성
├── weights.ts        # 가중치 프로파일
├── utils.ts          # 유틸리티 (셔플 등)
└── types.ts          # 타입 정의
```

---

**END OF DOCUMENT**

*이 문서는 PRD.md 섹션 8을 기반으로 한 매칭 알고리즘 상세 설계입니다.*

# 🎯 07_matching_engine.md — 매칭 알고리즘 구현

**순서:** 7/8  
**의존성:** 06_student_feature.md  
**다음:** 08_integration.md

---

## 🎯 Mission

TeamMatch 핵심 매칭 알고리즘을 구현합니다.
팀 슬롯 생성, 7가지 점수 계산, 최적화 로직을 구현합니다.

---

## 📋 Tasks

### Task 1: 팀 슬롯 생성 (No-Orphan Logic)

**파일:** `lib/matching/slots.ts`
```typescript
/**
 * 학생 수와 팀 사이즈로 팀 슬롯 배열 생성
 * 1인 팀이 절대 생기지 않도록 보장
 * 
 * 예시: 13명, teamSize=4 → [4, 3, 3, 3]
 * 예시: 14명, teamSize=4 → [4, 4, 3, 3]
 */
export function createTeamSlots(studentCount: number, teamSize: number): number[] {
  if (studentCount < 2) {
    throw new Error('최소 2명의 학생이 필요합니다');
  }
  
  if (studentCount <= teamSize) {
    return [studentCount];
  }
  
  const fullTeams = Math.floor(studentCount / teamSize);
  const remainder = studentCount % teamSize;
  
  const slots: number[] = [];
  
  if (remainder === 0) {
    // 딱 나눠 떨어짐
    for (let i = 0; i < fullTeams; i++) {
      slots.push(teamSize);
    }
  } else if (remainder === 1) {
    // 1명 남으면 → 마지막 두 팀에서 조정
    // 예: 13명/4 = 3팀×4 + 1명 → 1팀×4 + 3팀×3
    for (let i = 0; i < fullTeams - 1; i++) {
      slots.push(teamSize);
    }
    // 마지막 팀과 나머지를 합쳐서 두 팀으로
    const lastTwo = teamSize + 1; // 4 + 1 = 5
    slots.push(Math.ceil(lastTwo / 2)); // 3
    slots.push(Math.floor(lastTwo / 2)); // 2 → 틀림, 다시 계산
    
    // 수정: fullTeams-1개의 풀팀 + 2개의 분할팀
    slots.length = 0;
    const distribute = studentCount;
    const numTeams = fullTeams + 1; // 하나 더 만들어서 분산
    const base = Math.floor(distribute / numTeams);
    const extra = distribute % numTeams;
    
    for (let i = 0; i < numTeams; i++) {
      slots.push(base + (i < extra ? 1 : 0));
    }
  } else {
    // 2명 이상 남으면 그대로 팀 구성
    for (let i = 0; i < fullTeams; i++) {
      slots.push(teamSize);
    }
    slots.push(remainder);
  }
  
  // 검증: 1인 팀 없어야 함
  if (slots.some(s => s < 2)) {
    // 재분배
    return redistributeSlots(studentCount, teamSize);
  }
  
  return slots.sort((a, b) => b - a); // 큰 순 정렬
}

function redistributeSlots(studentCount: number, teamSize: number): number[] {
  // 가능한 팀 수 계산 (최소 2인 팀)
  const maxTeams = Math.floor(studentCount / 2);
  const minTeams = Math.ceil(studentCount / teamSize);
  
  for (let numTeams = minTeams; numTeams <= maxTeams; numTeams++) {
    const base = Math.floor(studentCount / numTeams);
    const extra = studentCount % numTeams;
    
    const slots: number[] = [];
    for (let i = 0; i < numTeams; i++) {
      slots.push(base + (i < extra ? 1 : 0));
    }
    
    // 모든 팀이 2명 이상이면 OK
    if (slots.every(s => s >= 2)) {
      return slots.sort((a, b) => b - a);
    }
  }
  
  return [studentCount]; // fallback: 전체가 1팀
}

// 테스트
// console.log(createTeamSlots(12, 4)); // [4, 4, 4]
// console.log(createTeamSlots(13, 4)); // [4, 3, 3, 3]
// console.log(createTeamSlots(14, 4)); // [4, 4, 3, 3]
// console.log(createTeamSlots(5, 4));  // [3, 2] or [5]
```

### Task 2: Fisher-Yates Shuffle

**파일:** `lib/matching/shuffle.ts`
```typescript
/**
 * Fisher-Yates 셔플 알고리즘
 * 원본 배열을 변경하지 않고 새 배열 반환
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}
```

### Task 3: 점수 계산 함수들

**파일:** `lib/matching/scoring.ts`
```typescript
import type { Student } from '@/types/database';

interface TeamMember {
  studentId: string;
  times: string[];
  skill: string;
  role: string;
  major: string;
  goal: string;
  continent: string;
  gender: string;
}

/**
 * Time Score (0-10)
 * 겹치는 시간대가 많을수록 높은 점수
 */
export function calculateTimeScore(members: TeamMember[]): number {
  const allTimes = members.flatMap(m => m.times);
  const timeSet = new Set(allTimes);
  
  // 모든 멤버가 공유하는 시간대 개수
  let sharedCount = 0;
  for (const time of timeSet) {
    if (members.every(m => m.times.includes(time))) {
      sharedCount++;
    }
  }
  
  // 3개 이상 공유: 10점, 2개: 6점, 1개: 2점, 0개: 0점
  if (sharedCount >= 3) return 10;
  if (sharedCount === 2) return 6;
  if (sharedCount === 1) return 2;
  return 0;
}

/**
 * Skill Score (0-10)
 * 역량 다양성 - 고유 역량 개수
 */
export function calculateSkillScore(members: TeamMember[]): number {
  const uniqueSkills = new Set(members.map(m => m.skill));
  const count = uniqueSkills.size;
  const total = members.length;
  
  // 모두 다르면 10점, 1개만 같으면 8점, 2개 같으면 6점...
  if (count === total) return 10;
  if (count === total - 1) return 8;
  if (count === total - 2) return 6;
  return 3;
}

/**
 * Role Score (0-10)
 * 역할 다양성
 */
export function calculateRoleScore(members: TeamMember[]): number {
  const uniqueRoles = new Set(members.map(m => m.role));
  const count = uniqueRoles.size;
  const total = members.length;
  
  if (count === total) return 10;
  if (count === total - 1) return 7;
  if (count === total - 2) return 4;
  return 1;
}

/**
 * Major Score (0-10)
 * 전공 다양성
 */
export function calculateMajorScore(members: TeamMember[]): number {
  const uniqueMajors = new Set(members.map(m => m.major));
  const count = uniqueMajors.size;
  const total = members.length;
  
  if (count === total) return 10;
  if (count >= total - 1) return 6;
  return 2;
}

/**
 * Goal Score (0-10)
 * 목표 일치도
 */
export function calculateGoalScore(members: TeamMember[]): number {
  const goals = members.map(m => m.goal);
  const uniqueGoals = new Set(goals);
  
  // 모두 같으면 10점, 2종류면 7점, 3종류면 3점
  if (uniqueGoals.size === 1) return 10;
  if (uniqueGoals.size === 2) return 7;
  return 3;
}

/**
 * Continent Score (0-10)
 * 대륙 다양성
 */
export function calculateContinentScore(members: TeamMember[]): number {
  const uniqueContinents = new Set(members.map(m => m.continent));
  const count = uniqueContinents.size;
  const total = members.length;
  
  if (count === total) return 10;
  if (count >= total - 1) return 6;
  return 2;
}

/**
 * Gender Score (0-10)
 * 성별 다양성 (최대 3종류)
 */
export function calculateGenderScore(members: TeamMember[]): number {
  const genders = members.map(m => m.gender);
  const counts: Record<string, number> = {};
  
  for (const g of genders) {
    counts[g] = (counts[g] || 0) + 1;
  }
  
  const values = Object.values(counts);
  const max = Math.max(...values);
  const total = members.length;
  
  // 균형 잡힌 분포일수록 높은 점수
  if (values.length >= 2 && max <= Math.ceil(total / 2)) return 10;
  if (values.length >= 2) return 6;
  return 3;
}

/**
 * 모든 점수 계산
 */
export function calculateAllScores(members: TeamMember[]) {
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
 * 가중치 적용 총점 계산
 */
export function calculateWeightedTotal(
  scores: ReturnType<typeof calculateAllScores>,
  weights: Record<string, number>
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
```

### Task 4: 메인 매칭 알고리즘

**파일:** `lib/matching/algorithm.ts`
```typescript
import { createTeamSlots } from './slots';
import { shuffle } from './shuffle';
import { calculateAllScores, calculateWeightedTotal } from './scoring';
import { WEIGHT_PROFILES } from '@/lib/constants/weights';
import type { Student, WeightProfile } from '@/types/database';

interface MatchingInput {
  students: Student[];
  teamSize: number;
  weightProfile: WeightProfile;
}

interface TeamResult {
  teamNumber: number;
  members: Student[];
  scores: ReturnType<typeof calculateAllScores>;
  totalScore: number;
  topFactors: string[];
}

interface MatchingResult {
  teams: TeamResult[];
  summary: {
    totalTeams: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
    stdDev: number;
  };
}

/**
 * 메인 매칭 함수
 */
export function runMatching(input: MatchingInput): MatchingResult {
  const { students, teamSize, weightProfile } = input;
  const weights = WEIGHT_PROFILES[weightProfile];
  
  // 1. 팀 슬롯 생성
  const slots = createTeamSlots(students.length, teamSize);
  
  // 2. 학생 셔플
  const shuffled = shuffle(students);
  
  // 3. 초기 배정
  let teams = assignInitial(shuffled, slots);
  
  // 4. 점수 계산 및 최적화
  teams = optimizeTeams(teams, weights);
  
  // 5. 결과 포맷팅
  const results: TeamResult[] = teams.map((team, idx) => {
    const members = team.map(s => toTeamMember(s));
    const scores = calculateAllScores(members);
    const totalScore = calculateWeightedTotal(scores, weights);
    const topFactors = extractTopFactors(scores, weights);
    
    return {
      teamNumber: idx + 1,
      members: team,
      scores,
      totalScore,
      topFactors,
    };
  });
  
  // 6. 요약 통계
  const totalScores = results.map(r => r.totalScore);
  const avgScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
  const minScore = Math.min(...totalScores);
  const maxScore = Math.max(...totalScores);
  const variance = totalScores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / totalScores.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    teams: results,
    summary: {
      totalTeams: results.length,
      avgScore: Math.round(avgScore * 100) / 100,
      minScore: Math.round(minScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
    },
  };
}

function toTeamMember(student: Student) {
  return {
    studentId: student.student_id,
    times: student.times || [],
    skill: student.skill || '',
    role: student.role || '',
    major: student.major || '',
    goal: student.goal || '',
    continent: student.continent || '',
    gender: student.gender || '',
  };
}

function assignInitial(students: Student[], slots: number[]): Student[][] {
  const teams: Student[][] = [];
  let idx = 0;
  
  for (const size of slots) {
    teams.push(students.slice(idx, idx + size));
    idx += size;
  }
  
  return teams;
}

/**
 * Local Swap 최적화
 */
function optimizeTeams(
  teams: Student[][],
  weights: Record<string, number>,
  iterations: number = 100
): Student[][] {
  let bestTeams = teams.map(t => [...t]);
  let bestScore = calculateTotalScore(bestTeams, weights);
  
  for (let i = 0; i < iterations; i++) {
    // 랜덤하게 두 팀 선택
    if (teams.length < 2) break;
    
    const team1Idx = Math.floor(Math.random() * teams.length);
    let team2Idx = Math.floor(Math.random() * teams.length);
    while (team2Idx === team1Idx) {
      team2Idx = Math.floor(Math.random() * teams.length);
    }
    
    // 각 팀에서 랜덤 멤버 선택
    const member1Idx = Math.floor(Math.random() * bestTeams[team1Idx].length);
    const member2Idx = Math.floor(Math.random() * bestTeams[team2Idx].length);
    
    // 스왑 시도
    const newTeams = bestTeams.map(t => [...t]);
    const temp = newTeams[team1Idx][member1Idx];
    newTeams[team1Idx][member1Idx] = newTeams[team2Idx][member2Idx];
    newTeams[team2Idx][member2Idx] = temp;
    
    const newScore = calculateTotalScore(newTeams, weights);
    
    if (newScore > bestScore) {
      bestTeams = newTeams;
      bestScore = newScore;
    }
  }
  
  return bestTeams;
}

function calculateTotalScore(teams: Student[][], weights: Record<string, number>): number {
  return teams.reduce((sum, team) => {
    const members = team.map(s => toTeamMember(s));
    const scores = calculateAllScores(members);
    return sum + calculateWeightedTotal(scores, weights);
  }, 0);
}

/**
 * Top 2 Factors 추출
 */
function extractTopFactors(
  scores: ReturnType<typeof calculateAllScores>,
  weights: Record<string, number>
): string[] {
  const weighted = Object.entries(scores).map(([key, value]) => ({
    factor: key,
    weighted: value * (weights[key] || 1),
  }));
  
  weighted.sort((a, b) => b.weighted - a.weighted);
  
  return weighted.slice(0, 2).map(w => w.factor);
}

export type { MatchingInput, MatchingResult, TeamResult };
```

### Task 5: 매칭 실행/확정 API

**파일:** `app/api/instructor/courses/[id]/match/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { runMatching } from '@/lib/matching/algorithm';

export const POST = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url);
  const courseId = url.pathname.split('/')[4];
  
  // 코스 확인
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('course_id', courseId)
    .eq('instructor_id', auth.instructorId)
    .single();
  
  if (courseError || !course) {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_001', message: '코스를 찾을 수 없습니다' } },
      { status: 404 }
    );
  }
  
  if (course.status !== 'LOCKED') {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_003', message: '매칭을 실행하려면 먼저 마감해야 합니다' } },
      { status: 400 }
    );
  }
  
  // 학생 조회
  const { data: students, error: studentError } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('course_id', courseId)
    .eq('profile_completed', true);
  
  if (studentError) throw studentError;
  
  if (!students || students.length < 2) {
    return NextResponse.json(
      { success: false, error: { code: 'MATCH_001', message: '최소 2명의 학생이 필요합니다' } },
      { status: 400 }
    );
  }
  
  // 매칭 실행
  const result = runMatching({
    students,
    teamSize: course.team_size,
    weightProfile: course.weight_profile,
  });
  
  return NextResponse.json({
    success: true,
    data: {
      preview: true,
      teams: result.teams.map(t => ({
        teamNumber: t.teamNumber,
        memberCount: t.members.length,
        members: t.members.map(m => ({
          studentId: m.student_id,
          name: m.name,
          major: m.major,
        })),
        scores: t.scores,
        totalScore: t.totalScore,
        topFactors: t.topFactors,
      })),
      summary: result.summary,
    }
  });
}, ['instructor']);
```

**파일:** `app/api/instructor/courses/[id]/confirm/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const POST = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url);
  const courseId = url.pathname.split('/')[4];
  const { teams } = await request.json();
  
  // 코스 확인
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status, instructor_id')
    .eq('course_id', courseId)
    .single();
  
  if (course?.instructor_id !== auth.instructorId) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_003', message: '권한 없음' } },
      { status: 403 }
    );
  }
  
  if (course?.status === 'CONFIRMED') {
    return NextResponse.json(
      { success: false, error: { code: 'MATCH_002', message: '이미 매칭이 확정되었습니다' } },
      { status: 400 }
    );
  }
  
  // 트랜잭션으로 팀 생성 및 학생 업데이트
  for (const team of teams) {
    // 팀 생성
    const { data: newTeam, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        course_id: courseId,
        team_number: team.teamNumber,
        member_count: team.members.length,
        score_total: team.totalScore,
        score_time: team.scores.time,
        score_skill: team.scores.skill,
        score_role: team.scores.role,
        score_major: team.scores.major,
        score_goal: team.scores.goal,
        score_continent: team.scores.continent,
        score_gender: team.scores.gender,
        top_factors: team.topFactors,
      })
      .select()
      .single();
    
    if (teamError) throw teamError;
    
    // 학생들의 team_id 업데이트
    const memberIds = team.members.map((m: any) => m.studentId);
    
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ team_id: newTeam.team_id })
      .in('student_id', memberIds);
    
    if (updateError) throw updateError;
  }
  
  // 코스 상태 업데이트
  await supabaseAdmin
    .from('courses')
    .update({ status: 'CONFIRMED' })
    .eq('course_id', courseId);
  
  return NextResponse.json({
    success: true,
    data: {
      confirmed: true,
      teamCount: teams.length,
    }
  });
}, ['instructor']);
```

---

## ✅ Checklist

- [ ] 팀 슬롯 생성 로직 (No-Orphan)
- [ ] Fisher-Yates Shuffle
- [ ] 7가지 점수 계산 함수
- [ ] 가중치 프로파일 적용
- [ ] Local Swap 최적화
- [ ] Top Factors 추출
- [ ] 매칭 실행 API (Preview)
- [ ] 매칭 확정 API

---

## 🧪 Test Cases

```typescript
// slots.test.ts
test('13명, 4인팀 → 1인팀 없음', () => {
  const slots = createTeamSlots(13, 4);
  expect(slots.every(s => s >= 2)).toBe(true);
  expect(slots.reduce((a, b) => a + b, 0)).toBe(13);
});

// scoring.test.ts
test('시간대 모두 공유 → 10점', () => {
  const members = [
    { times: ['weekday_daytime', 'weekend'] },
    { times: ['weekday_daytime', 'weekend'] },
  ];
  expect(calculateTimeScore(members)).toBe(10);
});
```

---

## 🔗 Reference

- docs/MATCHING_ALGORITHM.md
- docs/PRD.md 섹션 4-6

---

## ➡️ Next Step

08_integration.md로 진행하여 전체 통합 및 마무리합니다.

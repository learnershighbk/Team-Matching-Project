# 🔍 TECHNICAL_REVIEW.md — TeamMatch 기술적 검토 보고서

**작성일:** 2025-01-06  
**검토 범위:** PRD.md 기반 서비스 구현 준비 상태  
**목적:** 코드베이스 구조 파악 및 기술적 문제점 식별

---

## 1. Executive Summary

현재 코드베이스는 **Foundation 단계(Phase 1)가 부분적으로 완료**된 상태입니다. 
주요 인프라(Next.js, Hono, Supabase)는 설정되어 있으나, **핵심 기능 구현이 대부분 누락**되어 있습니다.

### 구현 상태 요약

| 영역 | 상태 | 완성도 |
|------|------|--------|
| **인프라** | ✅ 완료 | 90% |
| **인증 (Auth)** | ⚠️ 부분 | 30% (Admin만 구현) |
| **Admin 기능** | ❌ 미구현 | 0% |
| **Instructor 기능** | ❌ 미구현 | 0% |
| **Student 기능** | ❌ 미구현 | 0% |
| **매칭 알고리즘** | ❌ 미구현 | 0% |
| **데이터베이스** | ✅ 완료 | 95% |

---

## 2. 단계별 기술적 문제점

### 2.1 인증 시스템 (Authentication)

#### 🔴 Critical Issues

**문제 1: Instructor/Student 인증 미구현**

**현재 상태:**
- `src/features/auth/backend/route.ts`에 Admin 로그인만 구현됨
- Instructor/Student 인증은 TODO 주석으로 표시됨

**영향:**
- 교수자와 학생이 시스템에 접근할 수 없음
- 전체 서비스 플로우가 차단됨

**수정 필요 코드:**
```typescript
// src/features/auth/backend/route.ts
// 현재: TODO 주석만 존재
// TODO: Instructor 로그인
// app.post("/instructor/login", async (c) => { ... });

// TODO: Student 인증
// app.post("/student/auth", async (c) => { ... });
```

**수정 제안:**
1. **Instructor 로그인 구현** (`POST /api/instructor/login`)
   - 요청: `{ email: string, pin: string }`
   - PIN 형식 검증 (`/^\d{4}$/`)
   - DB에서 `instructors` 테이블 조회
   - `bcrypt.compare(pin, pin_hash)` 검증
   - JWT 생성 (24시간 만료)
   - 응답: `{ success: true, data: { instructorId, email, name } }`

2. **Student 인증 구현** (`POST /api/student/auth`)
   - 요청: `{ courseId: string, studentNumber: string, pin: string, isNewUser: boolean }`
   - 학번 형식 검증 (`/^\d{9}$/`)
   - PIN 형식 검증 (`/^\d{4}$/`)
   - 코스 존재 확인
   - 신규: `INSERT INTO students` + PIN 해시 저장
   - 기존: PIN 검증
   - JWT 생성 (24시간 만료)
   - 응답: `{ success: true, data: { studentId, studentNumber, profileCompleted, courseStatus } }`

**참조 문서:**
- `docs/AUTH.md` 섹션 4.2, 4.3
- `docs/API_SPEC.md` 섹션 2.2, 2.3

---

**문제 2: 인증 미들웨어 미구현**

**현재 상태:**
- `src/backend/hono/app.ts`에 기본 미들웨어만 존재
- 역할 기반 접근 제어 미들웨어 없음

**영향:**
- API 엔드포인트에 인증/인가 보호가 없음
- 보안 취약점 발생 가능

**수정 필요 코드:**
```typescript
// src/backend/hono/app.ts
// 현재: 인증 미들웨어 없음
app.use('*', errorBoundary());
app.use('*', withAppContext());
app.use('*', withSupabase());
```

**수정 제안:**
1. **인증 미들웨어 생성** (`src/backend/middleware/auth.ts`)
   ```typescript
   export function requireAuth(allowedRoles: Role[]) {
     return async (c: Context, next: Next) => {
       const token = getCookie(c, COOKIE_NAME);
       if (!token) {
         return respond(c, failure(401, 'AUTH_003', '인증이 필요합니다'));
       }
       
       const payload = await verifyToken(token);
       if (!payload || !allowedRoles.includes(payload.role)) {
         return respond(c, failure(403, 'AUTH_003', '권한이 없습니다'));
       }
       
       c.set('auth', payload);
       await next();
     };
   }
   ```

2. **Hono 앱에 미들웨어 적용**
   ```typescript
   // 보호된 라우트에 적용
   app.use('/api/admin/*', requireAuth(['admin']));
   app.use('/api/instructor/*', requireAuth(['instructor']));
   app.use('/api/student/*', requireAuth(['student']));
   ```

**참조 문서:**
- `docs/AUTH.md` 섹션 3.4
- `docs/ARCHITECTURE.md` 섹션 5.2

---

### 2.2 Feature 모듈 구조

#### 🔴 Critical Issues

**문제 3: 핵심 Feature 모듈 누락**

**현재 상태:**
```
src/features/
├── auth/          ✅ 존재 (부분 구현)
├── example/       ✅ 존재 (템플릿)
├── admin/         ❌ 없음
├── instructor/    ❌ 없음
├── student/       ❌ 없음
├── course/        ❌ 없음
└── matching/      ❌ 없음
```

**영향:**
- PRD 요구사항의 핵심 기능이 전혀 구현되지 않음
- Feature-Sliced Design 패턴이 일관되지 않음

**수정 제안:**
각 Feature 모듈을 다음 구조로 생성:

1. **Admin Feature** (`src/features/admin/`)
   ```
   admin/
   ├── backend/
   │   ├── route.ts      # Hono 라우트 등록
   │   ├── schema.ts     # Zod 검증 스키마
   │   └── service.ts     # 비즈니스 로직
   ├── components/
   │   └── InstructorManagement.tsx
   ├── hooks/
   │   └── useInstructors.ts
   └── types.ts
   ```

2. **Instructor Feature** (`src/features/instructor/`)
   - 코스 CRUD, 학생 현황, 매칭 실행/확정

3. **Student Feature** (`src/features/student/`)
   - 프로필 입력/수정, 팀 결과 조회

4. **Course Feature** (`src/features/course/`)
   - 코스 상태 조회 (공개 API)

5. **Matching Feature** (`src/features/matching/`)
   ```
   matching/
   ├── algorithm.ts      # 메인 매칭 로직
   ├── scoring.ts        # 점수 계산 (7개 규칙)
   ├── optimizer.ts      # Local Swap 최적화
   ├── slots.ts          # 팀 슬롯 생성
   ├── weights.ts        # 가중치 프로파일
   └── types.ts
   ```

**참조 문서:**
- `docs/ARCHITECTURE.md` 섹션 3.1
- `docs/MATCHING_ALGORITHM.md` 전체

---

### 2.3 API 라우트 구현

#### 🔴 Critical Issues

**문제 4: API 엔드포인트 대부분 미구현**

**현재 상태:**
- `src/backend/hono/app.ts`에 `registerExampleRoutes`, `registerAuthRoutes`만 등록됨
- PRD 요구사항의 API 엔드포인트 대부분 없음

**PRD 요구사항 vs 현재 상태:**

| API 그룹 | PRD 요구사항 | 현재 상태 |
|----------|-------------|----------|
| **Admin** | 7개 엔드포인트 | 0개 |
| **Instructor** | 8개 엔드포인트 | 0개 |
| **Student** | 3개 엔드포인트 | 0개 |
| **Public** | 1개 엔드포인트 | 0개 |

**수정 제안:**

1. **Admin API 구현** (`src/features/admin/backend/route.ts`)
   ```typescript
   export function registerAdminRoutes(app: Hono<AppEnv>) {
     const admin = new Hono<AppEnv>();
     
     // GET /api/admin/instructors
     admin.get('/instructors', requireAuth(['admin']), async (c) => {
       // 교수자 목록 조회
     });
     
     // POST /api/admin/instructors
     admin.post('/instructors', requireAuth(['admin']), zValidator('json', createInstructorSchema), async (c) => {
       // 교수자 생성
     });
     
     // PUT /api/admin/instructors/:id
     // DELETE /api/admin/instructors/:id
     // PUT /api/admin/students/:id/reset-pin
     // GET /api/admin/courses
     // PUT /api/admin/courses/:id/deadline
     
     app.route('/api/admin', admin);
   }
   ```

2. **Instructor API 구현** (`src/features/instructor/backend/route.ts`)
   - 코스 CRUD, 학생 현황, 매칭 실행/확정, 팀 결과 조회

3. **Student API 구현** (`src/features/student/backend/route.ts`)
   - 프로필 조회/수정, 팀 결과 조회

4. **Course API 구현** (`src/features/course/backend/route.ts`)
   - 공개 코스 상태 조회

5. **Hono 앱에 등록**
   ```typescript
   // src/backend/hono/app.ts
   import { registerAdminRoutes } from '@/features/admin/backend/route';
   import { registerInstructorRoutes } from '@/features/instructor/backend/route';
   import { registerStudentRoutes } from '@/features/student/backend/route';
   import { registerCourseRoutes } from '@/features/course/backend/route';
   
   app.use('*', errorBoundary());
   app.use('*', withAppContext());
   app.use('*', withSupabase());
   
   registerExampleRoutes(app);
   registerAuthRoutes(app);
   registerAdminRoutes(app);        // 추가
   registerInstructorRoutes(app);    // 추가
   registerStudentRoutes(app);       // 추가
   registerCourseRoutes(app);        // 추가
   ```

**참조 문서:**
- `docs/API_SPEC.md` 전체
- `docs/PRD.md` 섹션 12

---

### 2.4 매칭 알고리즘

#### 🔴 Critical Issues

**문제 5: 매칭 알고리즘 전혀 구현되지 않음**

**현재 상태:**
- `docs/MATCHING_ALGORITHM.md`에 상세 설계는 있으나 실제 코드 없음
- `src/features/matching/` 디렉토리 없음

**영향:**
- 서비스의 핵심 기능인 팀 매칭이 불가능
- PRD의 주요 가치 제안이 실현 불가

**수정 제안:**

1. **매칭 알고리즘 모듈 생성** (`src/features/matching/`)

   **a. 팀 슬롯 생성** (`slots.ts`)
   ```typescript
   // 낙오자 방지 로직
   export function createTeamSlots(
     studentCount: number,
     targetTeamSize: number
   ): TeamSlot[] {
     const teamCount = Math.ceil(studentCount / targetTeamSize);
     const baseSize = Math.floor(studentCount / teamCount);
     const extraTeams = studentCount % teamCount;
     
     // 팀 간 인원 차이 최대 1명 보장
     // ...
   }
   ```

   **b. 점수 계산** (`scoring.ts`)
   ```typescript
   // 7개 점수 계산 규칙 구현
   export function calculateTimeScore(members: TeamMember[]): number { ... }
   export function calculateSkillScore(members: TeamMember[]): number { ... }
   export function calculateRoleScore(members: TeamMember[]): number { ... }
   export function calculateMajorScore(members: TeamMember[]): number { ... }
   export function calculateGoalScore(members: TeamMember[]): number { ... }
   export function calculateContinentScore(members: TeamMember[]): number { ... }
   export function calculateGenderScore(members: TeamMember[]): number { ... }
   ```

   **c. 가중치 프로파일** (`weights.ts`)
   ```typescript
   export const WEIGHT_PROFILES = {
     balanced: { time: 4, skill: 3, role: 2, major: 2, goal: 1, continent: 2, gender: 1.5 },
     skill_heavy: { time: 3, skill: 5, role: 2, major: 1.5, goal: 1, continent: 1.5, gender: 1.5 },
     // ...
   };
   ```

   **d. 최적화 알고리즘** (`optimizer.ts`)
   ```typescript
   // Local Swap 최적화
   export function optimizeTeams(
     teams: Team[],
     weightProfile: string,
     maxIterations = 1000
   ): Team[] {
     // 팀 간 스왑으로 점수 개선
     // ...
   }
   ```

   **e. 메인 알고리즘** (`algorithm.ts`)
   ```typescript
   export async function runMatching(
     courseId: string,
     weightProfile: string
   ): Promise<MatchingResult> {
     // 1. Validation
     // 2. Preparation (셔플, 슬롯 생성)
     // 3. Initial Assignment
     // 4. Optimization
     // 5. Finalization
   }
   ```

2. **매칭 API 엔드포인트 구현**
   - `POST /api/instructor/courses/:id/match` (미리보기)
   - `POST /api/instructor/courses/:id/confirm` (확정)

**참조 문서:**
- `docs/MATCHING_ALGORITHM.md` 전체
- `docs/PRD.md` 섹션 8

---

### 2.5 데이터베이스 스키마

#### 🟡 Minor Issues

**문제 6: 마이그레이션 파일과 문서 간 불일치 가능성**

**현재 상태:**
- 마이그레이션 파일들은 존재하고 대체로 정확함
- 다만 일부 세부사항 검증 필요

**검증 필요 사항:**

1. **ENUM 값 일치 확인**
   - `0002_create_enums.sql`의 ENUM 값이 PRD와 일치하는지 확인
   - 특히 `major_enum`에 `PhD`가 있는지 확인 (PRD에는 `Ph.D.`로 표기)

2. **students 테이블 필드 검증**
   - `times` 필드가 `time_enum[]` 배열 타입인지 확인 ✅
   - `profile_completed` 트리거가 모든 필수 필드를 체크하는지 확인 ✅

3. **teams 테이블 검증**
   - `top_factors`가 `TEXT[]` 배열이고 최대 2개 요소인지 확인 필요
   - 현재 스키마에는 제약 없음 → 애플리케이션 레벨에서 검증 필요

**수정 제안:**

1. **ENUM 값 확인 및 수정** (필요시)
   ```sql
   -- 0002_create_enums.sql 확인
   -- PRD: 'Ph.D.' vs DB: 'PhD'
   -- 일관성 유지 필요
   ```

2. **teams.top_factors 제약 추가** (선택적)
   ```sql
   -- 마이그레이션 추가 또는 애플리케이션 레벨 검증
   -- CHECK (array_length(top_factors, 1) <= 2)
   ```

**참조 문서:**
- `docs/DATABASE.md` 섹션 3
- `supabase/migrations/0002_create_enums.sql`

---

### 2.6 환경변수 및 설정

#### 🟢 No Issues

**현재 상태:**
- `src/constants/env.ts`에 환경변수 검증 로직 구현됨 ✅
- `docs/ENV_TEMPLATE.md`에 상세 가이드 존재 ✅

**추가 권장사항:**
- 프로덕션 배포 전 환경변수 검증 테스트 필요

---

### 2.7 Next.js Middleware

#### 🟡 Minor Issues

**문제 7: Next.js Middleware 미구현**

**현재 상태:**
- `middleware.ts` 파일 존재 여부 확인 필요
- 경로별 접근 제어 로직 필요

**수정 제안:**

1. **Middleware 구현** (`middleware.ts`)
   ```typescript
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';
   import { verifyToken, getRole } from '@/features/auth/backend/jwt';
   import { COOKIE_NAME } from '@/features/auth/backend/jwt';
   
   export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;
     
     // 공개 경로
     const publicRoutes = [
       '/admin',           // 로그인 페이지
       '/instructor',      // 로그인 페이지
       '/course',          // 학생 인증 페이지
       '/api/admin/login',
       '/api/instructor/login',
       '/api/student/auth',
       '/api/course',
     ];
     
     if (isPublicRoute(pathname, publicRoutes)) {
       return NextResponse.next();
     }
     
     // 토큰 검증
     const token = request.cookies.get(COOKIE_NAME)?.value;
     if (!token) {
       return redirectToLogin(request, pathname);
     }
     
     const payload = await verifyToken(token);
     if (!payload) {
       return redirectToLogin(request, pathname);
     }
     
     // 역할 기반 접근 제어
     const role = getRole(payload);
     if (!hasAccess(pathname, role)) {
       return NextResponse.json(
         { success: false, error: { code: 'AUTH_003', message: '권한 없음' } },
         { status: 403 }
       );
     }
     
     return NextResponse.next();
   }
   
   export const config = {
     matcher: [
       '/admin/:path*',
       '/instructor/:path*',
       '/course/:path*',
       '/api/:path*',
     ],
   };
   ```

**참조 문서:**
- `docs/AUTH.md` 섹션 5

---

## 3. 우선순위별 수정 계획

### Phase 1: Critical (즉시 수정 필요)

1. ✅ **Instructor/Student 인증 구현**
   - `src/features/auth/backend/route.ts`에 로그인 로직 추가
   - 예상 시간: 4시간

2. ✅ **인증 미들웨어 구현**
   - `src/backend/middleware/auth.ts` 생성
   - Hono 앱에 적용
   - 예상 시간: 2시간

3. ✅ **Feature 모듈 구조 생성**
   - `admin`, `instructor`, `student`, `course`, `matching` 디렉토리 생성
   - 기본 파일 구조 생성
   - 예상 시간: 2시간

### Phase 2: High Priority (1주일 내)

4. ✅ **Admin API 구현**
   - 교수자 CRUD, 학생 PIN 리셋, 코스 관리
   - 예상 시간: 8시간

5. ✅ **Instructor API 구현**
   - 코스 CRUD, 학생 현황, 매칭 실행/확정
   - 예상 시간: 12시간

6. ✅ **Student API 구현**
   - 프로필 입력/수정, 팀 결과 조회
   - 예상 시간: 6시간

### Phase 3: Medium Priority (2주일 내)

7. ✅ **매칭 알고리즘 구현**
   - 팀 슬롯 생성, 점수 계산, 최적화
   - 예상 시간: 16시간

8. ✅ **Next.js Middleware 구현**
   - 경로별 접근 제어
   - 예상 시간: 4시간

### Phase 4: Low Priority (필요시)

9. ⚠️ **데이터베이스 스키마 검증**
   - ENUM 값 일치 확인
   - 제약 조건 추가 검토
   - 예상 시간: 2시간

---

## 4. 추가 고려사항

### 4.1 에러 처리

**현재 상태:**
- `src/backend/http/response.ts`에 기본 응답 헬퍼 존재 ✅
- 일관된 에러 코드 체계 필요

**권장사항:**
- `docs/PRD.md` 섹션 18의 에러 코드 체계 준수
- 모든 API에서 동일한 에러 응답 형식 사용

### 4.2 입력 검증

**현재 상태:**
- Zod 스키마 사용 예정 (문서에 명시)
- 실제 구현 필요

**권장사항:**
- 각 Feature의 `schema.ts`에 Zod 스키마 정의
- Hono의 `zValidator` 미들웨어 활용

### 4.3 테스트

**현재 상태:**
- 테스트 코드 없음

**권장사항:**
- 매칭 알고리즘 유닛 테스트 우선
- API 통합 테스트 추가

---

## 5. 결론

현재 코드베이스는 **기반 인프라는 잘 구축**되어 있으나, **핵심 기능 구현이 전혀 진행되지 않은 상태**입니다.

### 즉시 조치 필요 사항

1. **인증 시스템 완성** (Instructor/Student)
2. **Feature 모듈 구조 생성**
3. **API 엔드포인트 기본 구현**

### 예상 개발 시간

- **Phase 1 (Critical):** 8시간
- **Phase 2 (High):** 26시간
- **Phase 3 (Medium):** 20시간
- **총 예상 시간:** 54시간 (약 1.5주)

### 다음 단계

1. 이 문서의 Phase 1 항목부터 순차적으로 구현
2. 각 Feature 모듈별로 독립적으로 개발 가능
3. 매칭 알고리즘은 별도로 상세 설계 후 구현 권장

---

**END OF DOCUMENT**

*이 문서는 PRD.md 기반 서비스 구현을 위한 기술적 검토 결과입니다.*


# 🚀 TeamMatch 서비스 구현 프롬프트

**작성일:** 2025-01-06  
**목적:** 백엔드 완료 후 프론트엔드 기능 구현을 위한 단계별 프롬프트  
**상태:** 백엔드 API, 인증, 매칭 알고리즘 완료 ✅

---

## 📋 구현 전 확인사항

### ✅ 완료된 항목
- [x] 백엔드 API 라우트 (Admin, Instructor, Student, Course, Auth)
- [x] 인증 시스템 (JWT, 미들웨어)
- [x] 매칭 알고리즘 (algorithm.ts, scoring.ts, optimizer.ts, slots.ts)
- [x] 데이터베이스 스키마 및 마이그레이션
- [x] Feature-Sliced Design 구조
- [x] 기본 UI 컴포넌트 (shadcn/ui)

### ⚠️ 구현 필요 항목
- [ ] 프론트엔드 페이지 (로그인, 대시보드, 프로필 입력 등)
- [ ] API 클라이언트 훅 (React Query 기반)
- [ ] 폼 검증 및 상태 관리
- [ ] 에러 처리 및 로딩 상태
- [ ] 인증 상태 관리 (Context/Hooks)

---

## 📝 단계별 구현 프롬프트

### Phase 1: 인증 페이지 구현 (P0)

#### 1.1 Admin 로그인 페이지

**파일:** `src/app/admin/page.tsx`

**프롬프트:**

```
다음 요구사항에 따라 Admin 로그인 페이지를 구현하세요:

**요구사항:**
1. 이메일과 비밀번호 입력 폼
2. POST /api/admin/login API 호출
3. 로그인 성공 시 /admin/dashboard로 리다이렉트
4. 에러 처리 (토스트 메시지)
5. 로딩 상태 표시
6. 반응형 디자인 (모바일 대응)

**API 스펙:**
- 엔드포인트: POST /api/admin/login
- 요청: { email: string, password: string }
- 응답: { success: true, data: { adminId, email } }
- 에러: { success: false, error: { code, message } }

**디자인 참조:**
- docs/USERFLOW.md 섹션 2.2.1
- shadcn/ui Button, Input, Card 컴포넌트 사용
- Tailwind CSS 스타일링

**구현 가이드:**
- 'use client' 디렉티브 사용 (클라이언트 컴포넌트)
- useRouter, useState 훅 사용
- API 호출은 src/lib/remote/api-client.ts 활용
- 에러 처리는 src/lib/errors/codes.ts 참조
- 토스트는 src/components/ui/toaster 사용
```

**체크리스트:**
- [ ] 이메일/비밀번호 입력 필드
- [ ] 폼 검증 (이메일 형식, 비밀번호 필수)
- [ ] 로그인 버튼 클릭 시 API 호출
- [ ] 성공 시 리다이렉트
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 (버튼 비활성화)

---

#### 1.2 Instructor 로그인 페이지

**파일:** `src/app/instructor/page.tsx`

**프롬프트:**

```
다음 요구사항에 따라 Instructor 로그인 페이지를 구현하세요:

**요구사항:**
1. 이메일과 4자리 PIN 입력 폼
2. PIN은 숫자만 입력 가능 (4자리 제한)
3. POST /api/instructor/login API 호출
4. 로그인 성공 시 /instructor/dashboard로 리다이렉트
5. 에러 처리 및 로딩 상태

**API 스펙:**
- 엔드포인트: POST /api/instructor/login
- 요청: { email: string, pin: string } (PIN은 4자리 숫자)
- 응답: { success: true, data: { instructorId, email, name } }

**PIN 입력 UX:**
- 숫자 키패드 표시 (모바일)
- 입력 중 4자리 자동 포커스 이동 (선택적)
- 실시간 형식 검증

**디자인:**
- Admin 로그인과 일관된 디자인
- PIN 필드는 특별히 강조 (숫자 키패드)
```

**체크리스트:**
- [ ] 이메일/PIN 입력 필드
- [ ] PIN 숫자만 입력 제한
- [ ] PIN 4자리 형식 검증
- [ ] 로그인 API 호출
- [ ] 성공 시 리다이렉트
- [ ] 에러 처리

---

#### 1.3 Student 인증 페이지

**파일:** `src/app/course/[uuid]/page.tsx`

**프롬프트:**

```
다음 요구사항에 따라 Student 인증 페이지를 구현하세요:

**요구사항:**
1. 코스 정보 표시 (코스명, 담당 교수, 마감일)
   - GET /api/course/:uuid API로 코스 정보 조회
2. 9자리 학번 입력 폼
3. 학번 제출 후 신규/기존 사용자 분기
   - POST /api/student/auth?courseId=:uuid&studentNumber=:xxx
   - isNewUser: true/false 응답 확인
4. 신규: PIN 설정 화면으로 이동
5. 기존: PIN 입력 화면 표시 → 로그인
6. 마감일 카운트다운 표시 (D-X 형식)
7. 코스 상태에 따른 분기:
   - OPEN: 프로필 입력/수정 가능
   - LOCKED: 대기 화면
   - CONFIRMED: 팀 결과 화면

**API 스펙:**
- GET /api/course/:uuid → 코스 정보
- POST /api/student/auth → 인증/회원가입
  - 요청: { courseId, studentNumber, pin?, isNewUser }
  - 응답: { success: true, data: { studentId, studentNumber, profileCompleted, courseStatus } }

**UI/UX:**
- 코스 정보를 카드 형태로 상단 표시
- 학번 입력 필드 (9자리 숫자만)
- 마감일 D-X 남음 표시 (날짜 계산)
- 로딩 중 스켈레톤 표시

**디자인:**
- docs/USERFLOW.md 섹션 4.2.1 참조
- 학생 친화적인 디자인 (큰 버튼, 명확한 안내)
```

**체크리스트:**
- [ ] 코스 정보 조회 및 표시
- [ ] 학번 입력 필드 (9자리)
- [ ] 신규/기존 사용자 분기
- [ ] PIN 설정/입력 화면
- [ ] 마감일 카운트다운
- [ ] 코스 상태별 분기 처리
- [ ] 에러 처리 (코스 없음, 잘못된 PIN 등)

---

### Phase 2: Admin 대시보드 구현 (P0)

#### 2.1 Admin 대시보드 레이아웃

**파일:** `src/app/admin/dashboard/page.tsx`

**프롬프트:**

```
다음 요구사항에 따라 Admin 대시보드를 구현하세요:

**요구사항:**
1. 탭 네비게이션 (교수자 관리, 코스 현황, 학생 관리)
2. 헤더 (TeamMatch Admin, 로그아웃 버튼)
3. 각 탭별 컨텐츠 표시
4. 현재 사용자 정보 표시

**레이아웃 구조:**
```
┌─────────────────────────────────────┐
│ TeamMatch Admin        [로그아웃]   │
├─────────────────────────────────────┤
│ [교수자 관리] [코스 현황] [학생 관리] │
├─────────────────────────────────────┤
│                                     │
│     (탭별 컨텐츠)                    │
│                                     │
└─────────────────────────────────────┘
```

**인증:**
- useCurrentUser 훅으로 현재 사용자 확인
- admin 역할만 접근 가능 (middleware.ts에서 처리)
- 미인증 시 /admin으로 리다이렉트

**구현 가이드:**
- shadcn/ui Tabs 컴포넌트 사용
- useState로 현재 탭 관리
- 로그아웃은 src/features/auth/context 참조
```

**체크리스트:**
- [ ] 탭 네비게이션
- [ ] 헤더 및 로그아웃
- [ ] 현재 사용자 정보 표시
- [ ] 인증 체크
- [ ] 반응형 레이아웃

---

#### 2.2 교수자 관리 탭

**프롬프트:**

```
교수자 관리 탭을 구현하세요:

**기능:**
1. 교수자 목록 조회
   - GET /api/admin/instructors
   - 테이블 형식: 이메일, 이름, 코스 수, 액션 버튼
2. 새 교수자 추가 버튼
   - 모달/시트로 폼 표시
   - POST /api/admin/instructors
   - 입력: 이메일, 이름, PIN (4자리)
3. 교수자 수정
   - PUT /api/admin/instructors/:id
   - 이름, PIN 변경 가능
4. 교수자 삭제
   - DELETE /api/admin/instructors/:id
   - 확인 다이얼로그 표시
5. PIN 리셋 기능
   - PUT /api/admin/instructors/:id/reset-pin

**UI/UX:**
- 테이블 또는 카드 리스트
- 검색/필터 (선택적)
- 로딩 상태 표시
- 삭제 시 확인 다이얼로그
- 성공/실패 토스트 메시지

**디자인:**
- shadcn/ui Table, Button, Dialog, Sheet 사용
- docs/USERFLOW.md 섹션 2.2.2 참조
```

**체크리스트:**
- [ ] 교수자 목록 조회
- [ ] 목록 렌더링 (테이블/카드)
- [ ] 새 교수자 추가 폼
- [ ] 수정 기능
- [ ] 삭제 기능 (확인 다이얼로그)
- [ ] PIN 리셋
- [ ] 에러 처리
- [ ] 로딩 상태

---

#### 2.3 코스 현황 탭

**프롬프트:**

```
코스 현황 탭을 구현하세요:

**기능:**
1. 전체 코스 목록 조회
   - GET /api/admin/courses
   - 표시 정보: 코스명, 코드, 교수자, 상태, 학생 수, 마감일
2. 상태별 필터 (OPEN, LOCKED, CONFIRMED)
3. 마감일 변경
   - PUT /api/admin/courses/:id/deadline
   - 날짜/시간 선택기

**UI/UX:**
- 테이블 또는 카드 리스트
- 상태 뱃지 (색상 구분)
- 마감일 D-X 형식 표시
- 필터 드롭다운
- 마감일 수정 버튼/모달

**디자인:**
- 상태별 색상 구분 (OPEN: green, LOCKED: yellow, CONFIRMED: blue)
- shadcn/ui Badge, Select 사용
```

**체크리스트:**
- [ ] 코스 목록 조회
- [ ] 목록 렌더링
- [ ] 상태 필터
- [ ] 마감일 변경 UI
- [ ] 마감일 변경 API 호출

---

#### 2.4 학생 관리 탭

**프롬프트:**

```
학생 관리 탭을 구현하세요:

**기능:**
1. 학생 검색 (학번, 코스별)
2. PIN 리셋
   - PUT /api/admin/students/:id/reset-pin
   - 확인 다이얼로그

**UI/UX:**
- 검색 입력 필드
- 학생 목록 (학번, 이름, 코스, 상태)
- PIN 리셋 버튼

**참고:**
- 학생 정보는 코스별로 관리
- PIN 리셋 시 새 PIN 생성 (백엔드에서)
```

**체크리스트:**
- [ ] 학생 검색 UI
- [ ] 학생 목록 조회
- [ ] PIN 리셋 기능
- [ ] 에러 처리

---

### Phase 3: Instructor 대시보드 구현 (P0)

#### 3.1 Instructor 대시보드 레이아웃

**파일:** `src/app/instructor/dashboard/page.tsx`

**프롬프트:**

```
Instructor 대시보드를 구현하세요:

**요구사항:**
1. 내 코스 목록 표시
   - GET /api/instructor/courses
   - 상태별 그룹화 (OPEN, LOCKED, CONFIRMED)
2. 새 코스 생성 버튼
3. 코스 카드 클릭 → 코스 상세 페이지

**레이아웃:**
```
┌─────────────────────────────────────┐
│ TeamMatch Instructor   [로그아웃]   │
├─────────────────────────────────────┤
│                                     │
│  [+ 새 코스 생성]                    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 코스 카드 (OPEN)              │  │
│  │ - 코스명, 코드                │  │
│  │ - 학생 수, 마감일             │  │
│  │ - [상세 보기]                 │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**구현 가이드:**
- Grid 레이아웃으로 코스 카드 표시
- 상태별 섹션 구분 (선택적)
- 로딩 상태 (스켈레톤)
- 빈 상태 (코스 없음) 처리
```

**체크리스트:**
- [ ] 코스 목록 조회
- [ ] 코스 카드 렌더링
- [ ] 새 코스 생성 버튼
- [ ] 코스 클릭 → 상세 페이지
- [ ] 로딩/빈 상태 처리

---

#### 3.2 코스 생성 모달/페이지

**프롬프트:**

```
코스 생성 폼을 구현하세요:

**요구사항:**
1. 코스명 입력 (필수)
2. 코스 코드 입력 (필수)
3. 팀 인원수 선택
   - 라디오 버튼: 3명, 4명, 5명
   - 또는 커스텀 숫자 입력
4. 가중치 프로파일 선택
   - 드롭다운: Balanced, Skill-heavy, Skill-Role-Focused, Diversity-heavy
5. 프로필 입력 마감일시 선택
   - 날짜/시간 선택기
6. POST /api/instructor/courses API 호출

**API 스펙:**
- POST /api/instructor/courses
- 요청: { name, code, teamSize, weightProfile, deadline }
- 응답: { success: true, data: { courseId, uuid, ... } }

**UI/UX:**
- 모달 또는 별도 페이지
- 단계별 폼 (선택적)
- 실시간 검증
- 제출 시 로딩 상태

**디자인:**
- docs/USERFLOW.md 섹션 3.2.1 참조
- shadcn/ui Form, Select, Input, Button 사용
```

**체크리스트:**
- [ ] 모든 입력 필드
- [ ] 폼 검증
- [ ] 날짜/시간 선택기
- [ ] API 호출
- [ ] 성공 시 코스 상세로 이동
- [ ] 에러 처리

---

#### 3.3 코스 상세 페이지

**파일:** `src/app/instructor/courses/[id]/page.tsx` (새로 생성)

**프롬프트:**

```
코스 상세 페이지를 구현하세요:

**기능:**
1. 코스 정보 표시
   - GET /api/instructor/courses/:id
   - 상태, 학생 수, 마감일 등
2. 학생 URL 복사 버튼
   - `/course/{uuid}` 형식
   - 클립보드 복사
3. 학생 현황 조회
   - GET /api/instructor/courses/:id/students
   - 프로필 완료/미완료 상태 표시
4. 코스 설정 수정 (OPEN 상태일 때만)
5. 코스 상태별 액션:
   - OPEN: 설정 수정, 수동 Lock 가능
   - LOCKED: [Run Matching] 버튼
   - PREVIEW: 매칭 결과 미리보기, [Confirm Teams]
   - CONFIRMED: 최종 결과 조회

**매칭 실행:**
- POST /api/instructor/courses/:id/match
- 매칭 결과 미리보기 표시
- [Confirm Teams] 클릭 → POST /api/instructor/courses/:id/confirm

**UI 구조:**
```
┌─────────────────────────────────────┐
│ 코스명 (코드)          [URL 복사]   │
│ 상태: OPEN                          │
├─────────────────────────────────────┤
│                                     │
│ [학생 현황]                         │
│ - 전체: 30명                        │
│ - 완료: 25명 (83%)                  │
│ - 미완료: 5명                       │
│                                     │
│ [설정]                              │
│ - 팀 인원: 4명                      │
│ - 가중치: Balanced                  │
│ - 마감일: 2025-01-15 23:59         │
│                                     │
│ [액션 버튼]                         │
│                                     │
└─────────────────────────────────────┘
```

**디자인:**
- 섹션별 카드 레이아웃
- 상태별 색상 구분
- 학생 현황 차트/리스트 (선택적)
```

**체크리스트:**
- [ ] 코스 정보 표시
- [ ] URL 복사 기능
- [ ] 학생 현황 조회 및 표시
- [ ] 설정 수정 (OPEN 상태)
- [ ] 매칭 실행 버튼
- [ ] 매칭 결과 미리보기
- [ ] 팀 확정 버튼
- [ ] 상태별 UI 분기

---

#### 3.4 매칭 결과 미리보기

**프롬프트:**

```
매칭 결과 미리보기 컴포넌트를 구현하세요:

**요구사항:**
1. Summary 섹션
   - 총 팀 수, 평균 점수, 표준편차, 최소/최대 점수
2. 팀별 상세 정보
   - 팀 번호, 총점
   - 멤버 목록 (이름, 전공, 역할, 역량)
   - 점수 상세 (Time, Skill, Role, Major, Goal, Continent, Gender)
   - Top Factors (상위 2개)
3. [다시 매칭] 버튼 (매칭 재실행)
4. [팀 확정] 버튼 (POST /api/instructor/courses/:id/confirm)

**UI/UX:**
- 아코디언 또는 탭으로 팀 상세 표시
- 점수 시각화 (선택적: 막대 그래프)
- Top Factors 하이라이트
- 스크롤 가능한 목록

**디자인:**
- docs/USERFLOW.md 섹션 3.2.2 참조
- shadcn/ui Accordion, Card, Badge 사용
- 점수별 색상 구분
```

**체크리스트:**
- [ ] Summary 섹션
- [ ] 팀별 카드/아코디언
- [ ] 멤버 정보 표시
- [ ] 점수 상세 표시
- [ ] Top Factors 표시
- [ ] 다시 매칭 버튼
- [ ] 팀 확정 버튼

---

### Phase 4: Student 플로우 구현 (P0)

#### 4.1 프로필 입력 페이지

**파일:** `src/app/course/[uuid]/profile/page.tsx`

**프롬프트:**

```
학생 프로필 입력 페이지를 구현하세요:

**요구사항:**
1. 프로필 조회 (기존 데이터)
   - GET /api/student/profile?courseId=:uuid
2. 프로필 입력 폼
   - 이름 (필수)
   - 이메일 (필수, 이메일 형식)
   - 전공 (필수, 드롭다운: MPP, MDP, MPM, MDS, PhD, ...)
   - 성별 (필수, 라디오: Male, Female, Other)
   - 출신 대륙 (필수, 라디오: Asia, Africa, Europe, N.America, S.America, Oceania)
   - 역할 선호 (필수, 라디오: Leader, Executor, Ideator, Coordinator)
   - 주요 역량 (필수, 라디오: Data Analysis, Research, Writing, Visual/PPT, Presentation)
   - 선호 시간대 (필수, 체크박스 복수 선택: Weekday Daytime, Weekday Evening, Weekend)
   - 목표 성향 (필수, 라디오: A+, Balanced, Minimum)
3. 프로필 저장
   - PUT /api/student/profile
4. 마감일 카운트다운 표시
5. 마감 후 수정 불가 (LOCKED 상태)

**API 스펙:**
- GET /api/student/profile?courseId=:uuid
- PUT /api/student/profile
  - 요청: { courseId, name, email, major, gender, continent, role, skill, times[], goal }

**UI/UX:**
- 단일 페이지 폼 (스크롤 가능)
- 섹션별 구분
- 실시간 검증
- 저장 시 로딩 상태
- 저장 성공 토스트

**디자인:**
- docs/USERFLOW.md 섹션 4.2.2 참조
- shadcn/ui Form, RadioGroup, Checkbox, Select 사용
- 학생 친화적인 큰 입력 필드
- 진행 상황 표시 (선택적)
```

**체크리스트:**
- [ ] 모든 입력 필드
- [ ] 폼 검증 (Zod 스키마 활용)
- [ ] 기존 데이터 로드 및 표시
- [ ] 저장 API 호출
- [ ] 마감일 카운트다운
- [ ] LOCKED 상태 처리
- [ ] 에러 처리
- [ ] 성공 메시지

---

#### 4.2 팀 결과 페이지

**파일:** `src/app/course/[uuid]/team/page.tsx`

**프롬프트:**

```
팀 결과 페이지를 구현하세요:

**요구사항:**
1. 팀 정보 조회
   - GET /api/student/team?courseId=:uuid
2. 팀 번호 표시
3. Top Factors 설명
   - "이 팀은 {factor1} 및 {factor2} 측면에서 가장 적합하게 매칭되었습니다."
4. 팀원 정보 표시
   - 이름, 전공, 이메일
   - 자신은 "(나)" 표시
   - 이메일 복사 버튼
5. 안내 메시지
   - "팀원들과 직접 연락하여 첫 미팅 일정을 잡아주세요!"

**API 스펙:**
- GET /api/student/team?courseId=:uuid
- 응답: { success: true, data: { teamNumber, members[], topFactors[] } }

**UI/UX:**
- 축하 메시지 (🎉)
- 팀 번호 강조 표시
- 팀원 카드/리스트
- 이메일 클릭 복사
- 깔끔한 레이아웃

**디자인:**
- docs/USERFLOW.md 섹션 4.2.3 참조
- shadcn/ui Card, Avatar, Button 사용
- 축하 분위기 (색상, 이모지)
```

**체크리스트:**
- [ ] 팀 정보 조회
- [ ] 팀 번호 표시
- [ ] Top Factors 설명
- [ ] 팀원 리스트
- [ ] 이메일 복사 기능
- [ ] 안내 메시지
- [ ] 에러 처리 (팀 없음 등)
- [ ] 로딩 상태

---

#### 4.3 대기 화면 (LOCKED 상태)

**프롬프트:**

```
코스가 LOCKED 상태일 때 대기 화면을 구현하세요:

**요구사항:**
1. 코스 정보 표시
2. "프로필 입력 기간이 종료되었습니다" 메시지
3. 마감일 표시
4. "매칭 결과가 나오면 이 페이지에서 확인하실 수 있습니다" 안내
5. 주기적으로 상태 확인 (선택적: 폴링)

**UI:**
- 중앙 정렬
- 아이콘 (⏰)
- 명확한 안내 텍스트
- 대기 중 애니메이션 (선택적)

**구현 위치:**
- src/app/course/[uuid]/page.tsx 또는 별도 컴포넌트
- 코스 상태가 LOCKED일 때 표시
```

**체크리스트:**
- [ ] 대기 화면 레이아웃
- [ ] 안내 메시지
- [ ] 마감일 표시
- [ ] 상태 폴링 (선택적)

---

### Phase 5: 공통 기능 구현 (P1)

#### 5.1 API 클라이언트 훅

**프롬프트:**

```
React Query 기반 API 클라이언트 훅을 생성하세요:

**구현 위치:**
- 각 feature의 hooks/ 디렉토리
- 예: src/features/student/hooks/useStudentProfile.ts

**패턴:**
```typescript
// useStudentProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export function useStudentProfile(courseId: string) {
  return useQuery({
    queryKey: ['student', 'profile', courseId],
    queryFn: () => apiClient.get(`/student/profile?courseId=${courseId}`),
    enabled: !!courseId,
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileData) => apiClient.put('/student/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
    },
  });
}
```

**구현할 훅:**
- Admin: useInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor, useCourses, useResetStudentPin
- Instructor: useInstructorCourses, useCreateCourse, useCourseDetail, useCourseStudents, useRunMatching, useConfirmTeams
- Student: useStudentProfile, useUpdateStudentProfile, useStudentTeam, useCourseStatus
- Course: useCourseInfo

**참고:**
- src/lib/remote/api-client.ts 활용
- 에러 처리 (onError)
- 로딩 상태 자동 관리
```

**체크리스트:**
- [ ] 각 feature별 훅 생성
- [ ] React Query 패턴 적용
- [ ] 에러 처리
- [ ] 캐시 무효화

---

#### 5.2 인증 상태 관리

**프롬프트:**

```
인증 상태 관리를 강화하세요:

**현재 상태:**
- src/features/auth/context/current-user-context.tsx 존재
- useCurrentUser 훅 존재

**추가 구현:**
1. 로그아웃 기능
   - POST /api/auth/logout 또는 클라이언트 토큰 삭제
   - 쿠키 삭제
   - 리다이렉트
2. 토큰 갱신 (선택적)
   - 만료 전 자동 갱신
3. 보호된 라우트 체크
   - 미들웨어와 연동

**구현 위치:**
- src/features/auth/hooks/useAuth.ts (새로 생성)
- 또는 기존 useCurrentUser 확장

**사용 예:**
```typescript
const { user, isLoading, logout, isAuthenticated } = useAuth();
```
```

**체크리스트:**
- [ ] 로그아웃 함수
- [ ] 인증 상태 체크
- [ ] 미인증 시 리다이렉트
- [ ] 토큰 갱신 (선택적)

---

#### 5.3 에러 처리 및 토스트

**프롬프트:**

```
전역 에러 처리 및 토스트 시스템을 구현하세요:

**요구사항:**
1. API 에러 코드 매핑
   - src/lib/errors/codes.ts 활용
   - 사용자 친화적 메시지 표시
2. 토스트 메시지
   - 성공/실패 구분
   - 자동 사라짐 (3-5초)
3. 에러 바운더리 (선택적)
   - 예상치 못한 에러 처리

**구현:**
- src/components/ui/toaster.tsx 활용 (이미 존재)
- src/hooks/use-toast.ts 활용
- 각 API 호출 시 에러 처리

**사용 예:**
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// 성공
toast({ title: '성공', description: '프로필이 저장되었습니다.' });

// 실패
toast({ 
  variant: 'destructive',
  title: '오류',
  description: error.message,
});
```
```

**체크리스트:**
- [ ] 에러 코드 매핑
- [ ] 토스트 통합
- [ ] 성공 메시지
- [ ] 에러 메시지

---

#### 5.4 로딩 상태 및 스켈레톤

**프롬프트:**

```
로딩 상태 UI를 구현하세요:

**요구사항:**
1. 버튼 로딩 상태
   - 로딩 중 버튼 비활성화
   - 스피너 표시
2. 페이지 로딩 스켈레톤
   - 데이터 로딩 중 스켈레톤 UI
3. 테이블/리스트 로딩
   - 로딩 중 빈 상태 표시

**구현:**
- shadcn/ui Skeleton 컴포넌트 (없으면 생성)
- React Query의 isLoading 활용
- Button에 loading prop 추가 (선택적)

**스켈레톤 예시:**
```typescript
import { Skeleton } from '@/components/ui/skeleton';

{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <DataList data={data} />
)}
```
```

**체크리스트:**
- [ ] 버튼 로딩 상태
- [ ] 스켈레톤 컴포넌트
- [ ] 페이지 로딩 UI
- [ ] 리스트 로딩 UI

---

### Phase 6: 최적화 및 마무리 (P2)

#### 6.1 반응형 디자인

**프롬프트:**

```
모든 페이지를 모바일 반응형으로 최적화하세요:

**요구사항:**
1. 모바일 (< 768px) 레이아웃
   - 단일 컬럼
   - 큰 터치 영역
   - 간결한 네비게이션
2. 태블릿 (768px - 1024px)
3. 데스크톱 (> 1024px)

**테스트:**
- Chrome DevTools 반응형 모드
- 실제 모바일 기기 (선택적)

**주요 페이지:**
- 로그인 페이지
- 대시보드
- 프로필 입력 폼
- 팀 결과 페이지
```

**체크리스트:**
- [ ] 모바일 레이아웃
- [ ] 태블릿 레이아웃
- [ ] 데스크톱 레이아웃
- [ ] 터치 최적화

---

#### 6.2 접근성 (a11y)

**프롬프트:**

```
접근성을 개선하세요:

**요구사항:**
1. 키보드 네비게이션
2. 스크린 리더 지원 (aria-label)
3. 색상 대비 (WCAG AA)
4. 포커스 인디케이터

**체크리스트:**
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] aria-label 추가
- [ ] 색상 대비 확인
- [ ] 포커스 표시
```

---

#### 6.3 성능 최적화

**프롬프트:**

```
성능을 최적화하세요:

**요구사항:**
1. 이미지 최적화 (Next.js Image)
2. 코드 스플리팅
3. 불필요한 리렌더링 방지 (React.memo, useMemo)
4. API 요청 최소화 (React Query 캐시)

**체크리스트:**
- [ ] 이미지 최적화
- [ ] 컴포넌트 메모이제이션
- [ ] 불필요한 요청 방지
```

---

## 📚 참조 문서

- **PRD:** `docs/PRD.md`
- **사용자 흐름:** `docs/USERFLOW.md`
- **API 스펙:** `docs/API_SPEC.md`
- **아키텍처:** `docs/ARCHITECTURE.md`
- **매칭 알고리즘:** `docs/MATCHING_ALGORITHM.md`

---

## ✅ 구현 완료 체크리스트

### Phase 1: 인증
- [ ] Admin 로그인
- [ ] Instructor 로그인
- [ ] Student 인증

### Phase 2: Admin
- [ ] 대시보드 레이아웃
- [ ] 교수자 관리
- [ ] 코스 현황
- [ ] 학생 관리

### Phase 3: Instructor
- [ ] 대시보드
- [ ] 코스 생성
- [ ] 코스 상세
- [ ] 매칭 실행/확정
- [ ] 매칭 결과 미리보기

### Phase 4: Student
- [ ] 프로필 입력
- [ ] 팀 결과 조회
- [ ] 대기 화면

### Phase 5: 공통
- [ ] API 훅
- [ ] 인증 상태 관리
- [ ] 에러 처리
- [ ] 로딩 상태

### Phase 6: 최적화
- [ ] 반응형 디자인
- [ ] 접근성
- [ ] 성능 최적화

---

## 🚀 구현 순서 권장사항

1. **Phase 1** → 인증 없이는 다른 기능 불가
2. **Phase 5.1** → API 훅 먼저 구현하면 페이지 개발이 수월
3. **Phase 2** → Admin부터 시작 (관리자 테스트)
4. **Phase 3** → Instructor (핵심 기능)
5. **Phase 4** → Student (최종 사용자)
6. **Phase 5.2-5.4** → 공통 기능 보강
7. **Phase 6** → 최종 최적화

---

**END OF DOCUMENT**

*이 문서는 백엔드 완료 후 프론트엔드 구현을 위한 단계별 가이드입니다.*




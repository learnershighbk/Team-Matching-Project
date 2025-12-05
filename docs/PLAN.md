# 📋 PLAN.md — TeamMatch 개발 계획

**참조:** PRD.md 섹션 17  
**버전:** v1.0  

---

## 1. Overview

### 1.1 Timeline
| Phase | 기간 | 목표 |
|-------|------|------|
| **Phase 1: Foundation** | Week 1 | 프로젝트 셋업, DB, 인증 |
| **Phase 2: Core** | Week 2 | 학생/교수자/관리자 기능 |
| **Phase 3: Matching** | Week 3 | 알고리즘, 결과 표시 |
| **Phase 4: Polish** | Week 4 | UI/UX, 테스트, 배포 |

### 1.2 병렬 개발 가능 영역
```
Phase 1 완료 후:
├── [Backend Agent] API Routes 개발
├── [Frontend Agent] UI 컴포넌트 개발  ← 병렬 가능
├── [Database Agent] 쿼리 최적화       ← 병렬 가능
└── [Testing Agent] 테스트 작성        ← 병렬 가능
```

---

## 2. Phase 1: Foundation (Week 1)

### 2.1 Tasks

| ID | Task | Priority | Dependency | Agent |
|----|------|----------|------------|-------|
| 1.1 | Next.js 프로젝트 초기화 | P0 | - | Setup |
| 1.2 | Tailwind + shadcn/ui 설정 | P0 | 1.1 | Setup |
| 1.3 | 폴더 구조 생성 | P0 | 1.1 | Setup |
| 1.4 | TypeScript 설정 | P0 | 1.1 | Setup |
| 1.5 | Supabase 프로젝트 생성 | P0 | - | Database |
| 1.6 | DB 스키마 생성 (ENUM + Tables) | P0 | 1.5 | Database |
| 1.7 | RLS 정책 설정 | P1 | 1.6 | Database |
| 1.8 | Supabase 클라이언트 설정 | P0 | 1.5, 1.1 | Backend |
| 1.9 | 환경변수 설정 | P0 | 1.5 | Setup |
| 1.10 | JWT 유틸리티 구현 | P0 | 1.1 | Backend |
| 1.11 | 비밀번호 해싱 유틸리티 | P0 | 1.1 | Backend |
| 1.12 | Admin 로그인 API | P0 | 1.10 | Backend |
| 1.13 | Instructor 로그인 API | P0 | 1.10, 1.6 | Backend |
| 1.14 | Student 인증 API | P0 | 1.10, 1.6 | Backend |
| 1.15 | Next.js Middleware | P0 | 1.10 | Backend |

### 2.2 Deliverables
- [ ] 실행 가능한 Next.js 앱
- [ ] 모든 DB 테이블 생성됨
- [ ] 3가지 역할 로그인 작동
- [ ] JWT 기반 인증 완료

### 2.3 Definition of Done
```
✅ npm run dev로 로컬 실행 가능
✅ Admin/Instructor/Student 로그인 테스트 통과
✅ 보호된 라우트 접근 제어 작동
```

---

## 3. Phase 2: Core Features (Week 2)

### 3.1 Tasks

| ID | Task | Priority | Dependency | Agent |
|----|------|----------|------------|-------|
| 2.1 | Admin 대시보드 UI | P0 | Phase 1 | Frontend |
| 2.2 | 교수자 CRUD API | P0 | Phase 1 | Backend |
| 2.3 | 교수자 관리 UI | P0 | 2.1, 2.2 | Frontend |
| 2.4 | 학생 PIN 리셋 API | P1 | Phase 1 | Backend |
| 2.5 | 코스 CRUD API | P0 | Phase 1 | Backend |
| 2.6 | Instructor 대시보드 UI | P0 | Phase 1 | Frontend |
| 2.7 | 코스 생성 폼 | P0 | 2.5, 2.6 | Frontend |
| 2.8 | 코스 학생 현황 API | P0 | 2.5 | Backend |
| 2.9 | 학생 프로필 API | P0 | Phase 1 | Backend |
| 2.10 | 프로필 입력 폼 UI | P0 | 2.9 | Frontend |
| 2.11 | 학생 인증 페이지 | P0 | Phase 1 | Frontend |
| 2.12 | 코스 상태 API | P0 | 2.5 | Backend |
| 2.13 | 프로필 검증 (Zod) | P0 | 2.9 | Backend |
| 2.14 | 코스 Lock API | P1 | 2.5 | Backend |
| 2.15 | 마감 자동 Lock 로직 | P2 | 2.14 | Backend |

### 3.2 Deliverables
- [ ] Admin이 교수자 관리 가능
- [ ] Instructor가 코스 생성/관리 가능
- [ ] Student가 프로필 입력 가능
- [ ] 코스 상태 전이 작동

### 3.3 Definition of Done
```
✅ Admin → 교수자 생성 → Instructor 로그인 → 코스 생성 → 학생 URL 접속 → 프로필 입력 전체 플로우 작동
✅ 마감 후 프로필 수정 차단됨
```

---

## 4. Phase 3: Matching (Week 3)

### 4.1 Tasks

| ID | Task | Priority | Dependency | Agent |
|----|------|----------|------------|-------|
| 3.1 | 팀 슬롯 생성 로직 | P0 | - | Backend |
| 3.2 | 점수 계산 함수 (7개) | P0 | - | Backend |
| 3.3 | 가중치 프로파일 적용 | P0 | 3.2 | Backend |
| 3.4 | 초기 배정 알고리즘 | P0 | 3.1 | Backend |
| 3.5 | Local Swap 최적화 | P0 | 3.2, 3.4 | Backend |
| 3.6 | Top Factors 추출 | P1 | 3.2 | Backend |
| 3.7 | 매칭 실행 API | P0 | 3.1-3.6 | Backend |
| 3.8 | 매칭 확정 API | P0 | 3.7 | Backend |
| 3.9 | 매칭 미리보기 UI | P0 | 3.7 | Frontend |
| 3.10 | 팀 결과 조회 API (학생) | P0 | 3.8 | Backend |
| 3.11 | 팀 결과 조회 API (교수자) | P0 | 3.8 | Backend |
| 3.12 | 학생 팀 결과 UI | P0 | 3.10 | Frontend |
| 3.13 | 교수자 팀 결과 UI | P1 | 3.11 | Frontend |
| 3.14 | 매칭 설명 템플릿 | P1 | 3.6 | Backend |
| 3.15 | 알고리즘 유닛 테스트 | P0 | 3.1-3.6 | Testing |

### 4.2 Deliverables
- [ ] 매칭 알고리즘 완성
- [ ] 낙오자 0명 보장
- [ ] 매칭 실행/확정 작동
- [ ] 팀 결과 표시

### 4.3 Definition of Done
```
✅ 13명, teamSize=4 → 4+3+3+3 배정
✅ 매칭 3초 이내 (50명)
✅ 재매칭 후 확정 가능
✅ 학생이 팀원 정보 조회 가능
```

---

## 5. Phase 4: Polish (Week 4)

### 5.1 Tasks

| ID | Task | Priority | Dependency | Agent |
|----|------|----------|------------|-------|
| 4.1 | UI/UX 개선 | P1 | Phase 2-3 | Frontend |
| 4.2 | 반응형 디자인 | P1 | 4.1 | Frontend |
| 4.3 | 로딩 상태 처리 | P1 | Phase 2-3 | Frontend |
| 4.4 | 에러 처리 개선 | P1 | Phase 2-3 | Backend |
| 4.5 | Toast 알림 | P2 | 4.1 | Frontend |
| 4.6 | E2E 테스트 | P1 | Phase 1-3 | Testing |
| 4.7 | 통합 테스트 | P1 | Phase 1-3 | Testing |
| 4.8 | 성능 최적화 | P2 | Phase 1-3 | Backend |
| 4.9 | Vercel 배포 설정 | P0 | Phase 1-3 | Setup |
| 4.10 | 환경변수 설정 (Vercel) | P0 | 4.9 | Setup |
| 4.11 | 도메인 설정 | P2 | 4.9 | Setup |
| 4.12 | 최종 QA | P0 | 4.1-4.8 | Testing |

### 5.2 Deliverables
- [ ] 프로덕션 배포 완료
- [ ] 모든 테스트 통과
- [ ] UI/UX 완성

### 5.3 Definition of Done
```
✅ Vercel에 배포됨
✅ 전체 플로우 E2E 테스트 통과
✅ Lighthouse Score > 90
```

---

## 6. Task Dependencies Graph

```
Phase 1 (Foundation)
─────────────────────
1.1 Next.js Init
 │
 ├──▶ 1.2 Tailwind
 ├──▶ 1.3 Folders
 ├──▶ 1.4 TypeScript
 │
 └──▶ 1.8 Supabase Client ◀── 1.5 Supabase Project
                                    │
                                    └──▶ 1.6 Schema ──▶ 1.7 RLS

1.10 JWT Utils ──┬──▶ 1.12 Admin Login
                 ├──▶ 1.13 Instructor Login ◀── 1.6
                 ├──▶ 1.14 Student Auth ◀── 1.6
                 └──▶ 1.15 Middleware

Phase 2 (Core)
─────────────────────
                    ┌──▶ 2.3 교수자 UI
2.2 교수자 API ────┤
                    └──▶ 2.1 Admin Dashboard

2.5 코스 API ──┬──▶ 2.7 코스 생성 폼
               ├──▶ 2.8 학생 현황 API
               └──▶ 2.14 Lock API

2.9 프로필 API ──▶ 2.10 프로필 폼 ◀── 2.13 Validation

Phase 3 (Matching)
─────────────────────
3.1 Slot ───┐
3.2 Score ──┼──▶ 3.4 Initial ──▶ 3.5 Optimize ──▶ 3.7 Match API
3.3 Weight ─┘                                          │
                                                       ▼
3.8 Confirm API ──┬──▶ 3.10 Student Result ──▶ 3.12 Student UI
                  └──▶ 3.11 Instructor Result ──▶ 3.13 Instructor UI
```

---

## 7. Agent Assignment

### 7.1 Agent별 담당 영역

| Agent | 주요 담당 | 파일 위치 |
|-------|----------|----------|
| **Setup** | 프로젝트 초기화, 배포 | 루트, 설정 파일 |
| **Backend** | API Routes, 비즈니스 로직 | `app/api/`, `lib/` |
| **Frontend** | UI 컴포넌트, 페이지 | `app/`, `components/` |
| **Database** | 스키마, 쿼리, RLS | `supabase/`, `lib/db/` |
| **Testing** | 테스트 코드 | `__tests__/` |

### 7.2 병렬 작업 가능 구간

```
Week 1: 순차 (Setup 먼저)
Week 2: Backend + Frontend 병렬
Week 3: Backend (Algorithm) + Frontend (UI) 병렬 + Testing
Week 4: 전체 병렬
```

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 매칭 알고리즘 성능 | High | 조기 테스트, 최적화 예비 시간 |
| Supabase RLS 복잡성 | Medium | Service Role 우선, 점진적 적용 |
| UI 일관성 부족 | Medium | shadcn/ui 활용, 디자인 시스템 |
| 배포 환경 이슈 | Medium | 조기 Preview 배포 |

---

## 9. Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| **M1: Auth Complete** | Week 1 End | 3역할 로그인 작동 |
| **M2: Core Complete** | Week 2 End | 전체 플로우 작동 |
| **M3: Matching Complete** | Week 3 End | 팀 배정 완료 |
| **M4: Production Ready** | Week 4 End | 배포 완료 |

---

**END OF DOCUMENT**

# CLAUDE.md — TeamMatch MVP 프로젝트 가이드

> Claude Code가 이 프로젝트를 이해하고 작업할 때 참조하는 핵심 문서입니다.

---

## 🎯 Project Overview

**TeamMatch**는 KDI School의 팀 프로젝트 매칭 서비스입니다.

- **목적:** AI 기반 알고리즘으로 학생들을 최적의 팀으로 구성
- **사용자:** Admin, Instructor, Student (3가지 역할)
- **핵심 기능:** 코스 생성 → 학생 프로필 수집 → 매칭 실행 → 팀 결과 공개

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (jose) + bcryptjs |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Testing | Jest + Playwright |
| Deploy | Vercel |

---

## 📁 Project Structure

```
teammatch/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 필요 페이지
│   │   ├── admin/         # Admin 페이지
│   │   └── instructor/    # Instructor 페이지
│   ├── course/[uuid]/     # Student 페이지
│   ├── api/               # API Routes
│   └── layout.tsx
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui
│   ├── forms/
│   └── shared/
├── lib/                   # 유틸리티
│   ├── auth/             # JWT, 해싱
│   ├── matching/         # 매칭 알고리즘
│   ├── supabase/         # DB 클라이언트
│   └── validators/       # Zod 스키마
├── types/                 # TypeScript 타입
├── docs/                  # 문서
├── prompts/              # 단계별 프롬프트
└── claude/agents/        # 에이전트 가이드
```

---

## 📚 Documentation

### 핵심 문서 (docs/)

| 문서 | 용도 |
|------|------|
| `PRD.md` | 전체 요구사항 명세 |
| `ARCHITECTURE.md` | 기술 아키텍처 |
| `DATABASE.md` | DB 스키마 |
| `API_SPEC.md` | API 명세 |
| `AUTH.md` | 인증 시스템 |
| `MATCHING_ALGORITHM.md` | 매칭 알고리즘 |
| `CONVENTIONS.md` | 코딩 규칙 |

### 개발 순서 (prompts/)

```
01_setup.md        → 프로젝트 초기화
02_database.md     → DB 스키마 설정
03_auth_backend.md → 인증 구현
04_admin_feature.md → Admin 기능
05_instructor_feature.md → Instructor 기능
06_student_feature.md → Student 기능
07_matching_engine.md → 매칭 알고리즘
08_integration.md → 통합 및 마무리
```

### 에이전트 가이드 (claude/agents/)

- `orchestrator.md` - 전체 조율
- `backend-agent.md` - API 구현
- `frontend-agent.md` - UI 구현
- `database-agent.md` - DB 관리
- `testing-agent.md` - 테스트

---

## 🔑 Key Concepts

### Authentication

| Role | Method | Token Expiry |
|------|--------|--------------|
| Admin | Email + Password (ENV) | 4h |
| Instructor | Email + 4-digit PIN | 24h |
| Student | 9-digit 학번 + 4-digit PIN | 24h |

### Course Status Flow

```
OPEN → LOCKED → CONFIRMED
  ↓        ↓         ↓
학생입력   매칭가능   결과공개
```

### Matching Algorithm

1. **No-Orphan Logic:** 1인 팀 절대 생성 안됨
2. **7가지 점수:** Time, Skill, Role, Major, Goal, Continent, Gender
3. **4가지 가중치 프로파일:** Balanced, Skill-heavy, Skill-Role-Focused, Diversity-heavy
4. **최적화:** Local Swap으로 점수 향상

---

## ⚡ Quick Commands

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm run test
npm run test:e2e

# 타입 체크
npm run type-check

# Lint
npm run lint
```

---

## 🚨 Important Rules

### 코딩 규칙

1. **TypeScript 필수** - `any` 사용 금지
2. **파일명:** Components는 PascalCase, utils는 camelCase
3. **API 응답:** 항상 `{ success, data/error }` 형식
4. **에러 코드:** AUTH_001, COURSE_001 등 표준 코드 사용

### 보안 규칙

1. `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
2. JWT는 HttpOnly 쿠키에 저장
3. PIN은 bcrypt로 해싱

### 매칭 규칙

1. 1인 팀 생성 절대 금지
2. 팀 간 인원 차이 최대 1명
3. 매칭은 LOCKED 상태에서만 가능
4. 확정 전 재매칭 가능

---

## 🎯 Current Task

> 이 섹션에 현재 작업 중인 내용을 기록합니다.

**Phase:** [현재 단계]
**Task:** [현재 작업]
**Status:** [진행 상태]

---

## 📞 Getting Help

1. **스펙 불명확:** `docs/PRD.md` 참조
2. **API 구현:** `docs/API_SPEC.md` 참조
3. **DB 쿼리:** `docs/DATABASE.md` 참조
4. **알고리즘:** `docs/MATCHING_ALGORITHM.md` 참조

---

## ✅ MVP Checklist

- [ ] Admin 로그인 및 교수자 관리
- [ ] Instructor 코스 생성 및 관리
- [ ] Student 프로필 입력
- [ ] 매칭 알고리즘 실행
- [ ] 팀 결과 조회
- [ ] Vercel 배포

---

*이 문서는 Claude Code가 프로젝트를 이해하는 데 필요한 핵심 정보를 제공합니다.*

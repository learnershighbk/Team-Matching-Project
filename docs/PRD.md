# 📘 PRD v2.1 — TeamMatch MVP (Final)

**작성자:** CTO  
**버전:** v2.1 (Final for Development)  
**최종 업데이트:** 2025-01-06

---

## 1. Product Overview

TeamMatch는 KDI School 수업에서 팀 프로젝트 구성을 **1분 입력, 1클릭 매칭**으로 해결하는 웹 서비스입니다.

**MVP 핵심 가치:**
- 학생: 1분 내 프로필 입력 → 자동 팀 배정
- 교수자: 클릭 한 번으로 최적화된 팀 구성
- 관리자: 교수자 계정 및 시스템 관리

---

## 2. Users & Roles (3-Role Model)

### 2.1 관리자 (Admin)
- 시스템 전체 관리
- 교수자 계정 생성/수정/삭제
- 학생 PIN 리셋
- 코스 마감기한 변경
- 전체 코스 및 매칭 현황 조회

### 2.2 교수자 (Instructor)
- 코스 생성 및 설정
- 팀 인원수/가중치/마감기한 설정
- 매칭 실행 및 확정
- 팀별 점수 조회

### 2.3 학생 (Student)
- 프로필 입력 (1~2분 소요)
- 마감 전 프로필 수정
- 팀 결과 확인 (팀원 이름, 전공, 이메일)

---

## 3. Authentication & Authorization

### 3.1 관리자 인증

| 항목 | 설정 |
|------|------|
| 계정 수 | 단일 계정 |
| 인증 방식 | 이메일 + 비밀번호 |
| 저장 위치 | 환경변수 |
| 세션 | JWT (4시간) |

```env
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=1217
```

### 3.2 교수자 인증

| 항목 | 설정 |
|------|------|
| 계정 생성 | Admin이 등록 |
| 인증 방식 | 이메일 + 4자리 PIN |
| PIN 변경 | Admin만 가능 |
| 세션 | JWT (24시간) |

**플로우:**
1. Admin이 교수자 이메일 + 4자리 PIN 등록
2. Admin이 교수자에게 로그인 정보 안내
3. 교수자가 로그인하여 코스 생성/관리

### 3.3 학생 인증

| 항목 | 설정 |
|------|------|
| ID | 9자리 학번 (`/^\d{9}$/`) |
| Password | 4자리 PIN (`/^\d{4}$/`) |
| 가입 | 최초 접속 시 자동 (PIN 설정) |
| PIN 리셋 | Admin만 가능 |
| 세션 | JWT (24시간) |

**플로우:**
1. 학생이 코스 URL 접속
2. 9자리 학번 입력
3. 최초 접속: 4자리 PIN 설정 → 프로필 입력
4. 재접속: 학번 + PIN 로그인 → 프로필 수정 또는 팀 결과 확인

---

## 4. Entry Point & URL Structure

```
학생용:    /course/{course_uuid}
교수자용:  /instructor
관리자용:  /admin
```

- `course_uuid`: UUID v4 (추측 불가능)
- 학생 데이터는 URL의 `course_uuid`에 자동 매핑

---

## 5. Course Status (3-State Model)

```
OPEN → LOCKED → CONFIRMED
```

| 상태 | 학생 | 교수자 |
|------|------|--------|
| **OPEN** | 프로필 입력/수정 가능 | 학생 현황 조회 |
| **LOCKED** | 입력/수정 불가, 대기 화면 | 매칭 실행 가능 |
| **CONFIRMED** | 팀 결과 확인 | 최종 결과 조회 |

---

## 6. Student Profile Inputs (8개 항목)

### 6.1 이름 (Name) — 필수
- 텍스트 입력
- 팀 결과에서 팀원에게 공개

### 6.2 이메일 (Email) — 필수
- 이메일 형식 검증
- 팀 결과에서 팀원에게 공개

### 6.3 전공 (Major) — 단일 선택
- MPP
- MDP
- MPM
- MDS
- MIPD
- MPPM
- Ph.D.

### 6.4 성별 (Gender) — 단일 선택
- Male
- Female
- Other

### 6.5 출신대륙 (Continent) — 단일 선택
- Asia
- Africa
- Europe
- North America
- South America
- Oceania

### 6.6 역할 선호 (Role Preference) — 단일 선택
- Leader (리더)
- Executor (실무)
- Ideator (아이디어)
- Coordinator (조정자)

### 6.7 주요 역량 (Main Skill) — 단일 선택
- Data Analysis
- Research
- Writing
- Visual/PPT
- Presentation

### 6.8 선호 시간대 (Time Preference) — **다중 선택**
- Weekday Daytime
- Weekday Evening
- Weekend

### 6.9 목표 성향 (Project Orientation) — 단일 선택
- A+ (최고 성적 목표)
- Balanced (균형)
- Minimum Completion (최소 완성)

---

## 7. Instructor Settings

### 7.1 팀 인원수 (team_size)

| 옵션 | 설명 |
|------|------|
| 3명 | 소규모 팀 |
| 4명 | **기본값** |
| 5명 | 중규모 팀 |
| Custom | 2~6명 범위 직접 입력 |

### 7.2 가중치 프로파일 (weight_profile)

| Profile | Time | Skill | Role | Major | Goal | Continent | Gender |
|---------|------|-------|------|-------|------|-----------|--------|
| **Balanced** (기본) | 4 | 3 | 2 | 2 | 1 | 2 | 1.5 |
| **Skill-heavy** | 3 | 5 | 2 | 1.5 | 1 | 1.5 | 1.5 |
| **Skill-Role-Focused** | 3 | 4 | 3 | 1.5 | 1 | 1.5 | 1.5 |
| **Diversity-heavy** | 3 | 2 | 1.5 | 3 | 1 | 3 | 3 |

### 7.3 프로필 입력 마감기한 (deadline)

- **설정 권한:** 교수자 (원칙), Admin (변경 가능)
- 날짜 + 시간 설정
- 마감 시 자동으로 `OPEN → LOCKED`
- 마감 전: 학생 프로필 수정 가능
- 마감 후: 학생 프로필 조회만 가능

---

## 8. Matching Algorithm

### 8.1 낙오자 방지 로직 (Critical)

**원칙:** 팀 간 인원 차이는 **최대 1명**

```
예시: 13명, team_size=4

❌ Wrong:  4+4+4+1 (1명 팀 발생)
✅ Correct: 4+3+3+3 (균등 분배)

계산:
- 팀 수 = ceil(13/4) = 4팀
- 기본 인원 = floor(13/4) = 3명
- 추가 배정 = 13 mod 4 = 1팀에 +1명
- 결과: 4+3+3+3
```

### 8.2 Batch Matching 프로세스

```
1. Status가 LOCKED인지 확인
2. 학생 전체 랜덤 셔플
3. 낙오자 방지 로직으로 팀 슬롯 생성
4. 초기 임의 배정
5. Role & Skill Balance 조정
6. Diversity (대륙/성별/전공) 조정
7. Time & Goal Optimization
8. Local Swap Optimization (점수 최대화)
9. 팀 간 점수 편차 최소화
10. 최종 확정
```

### 8.3 점수 계산 규칙 (7개)

| Rule | 조건 | 점수 |
|------|------|------|
| **Time Overlap** | 전원 일치 시간대 1개+ | 10 |
| | 과반수 일치 | 6 |
| | 그 외 | 2 |
| **Skill Balance** | 5가지 모두 보유 | 10 |
| | 4가지 | 8 |
| | 3가지 | 6 |
| | 2가지 이하 | 3 |
| **Role Balance** | 4가지 역할 모두 | 10 |
| | 3가지 | 7 |
| | 2가지 | 4 |
| | 1가지 | 1 |
| **Major Diversity** | 3개+ 전공 | 10 |
| | 2개 전공 | 6 |
| | 단일 전공 | 2 |
| **Goal Alignment** | 전원 동일 | 10 |
| | 1명 다름 | 7 |
| | 2명+ 다름 | 3 |
| **Continent Diversity** | 3개+ 대륙 | 10 |
| | 2개 대륙 | 6 |
| | 단일 대륙 | 2 |
| **Gender Diversity** | 혼합 (2개+ 성별) | 10 |
| | 단일 성별 | 3 |

### 8.4 최종 점수 계산

```
Team Score = Σ(Raw Score × Weight)

예시 (Balanced 프로파일):
= (Time×4) + (Skill×3) + (Role×2) + (Major×2) 
  + (Goal×1) + (Continent×2) + (Gender×1.5)

최대 가능 점수: 10 × (4+3+2+2+1+2+1.5) = 10 × 15.5 = 155점
```

### 8.5 최적화 목표

```
Primary: 모든 팀 점수의 평균 최대화
Secondary: 팀 간 점수 편차 최소화
```

---

## 9. Team Result Output

### 9.1 학생에게 공개되는 정보

| 항목 | 공개 여부 |
|------|----------|
| 팀원 이름 (Name) | ✅ 공개 |
| 팀원 전공 (Major) | ✅ 공개 |
| 팀원 이메일 (Email) | ✅ 공개 |
| 성별 | ❌ 비공개 |
| 대륙 | ❌ 비공개 |
| 역할 선호 | ❌ 비공개 |
| 역량 | ❌ 비공개 |
| 목표 성향 | ❌ 비공개 |
| 팀 점수 | ❌ 비공개 |

### 9.2 매칭 설명 (Rule-based Template)

LLM 사용 없이, **점수 상위 2개 Factor**를 템플릿에 대입:

```
"이 팀은 {Factor1} 및 {Factor2} 측면에서 
가장 적합하게 매칭되었습니다."

예시:
"이 팀은 시간대(Time) 및 역량 균형(Skill) 측면에서 
가장 적합하게 매칭되었습니다."
```

### 9.3 교수자/관리자 대시보드

- 모든 팀 구성 정보
- 팀별 총점 및 세부 점수 breakdown
- 전체 평균 점수
- 팀 간 점수 편차

---

## 10. Data Model

### 10.1 Admin (환경변수)

```env
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=1217
```

### 10.2 instructors

```sql
instructor_id: UUID (PK)
email: string (UNIQUE)
pin_hash: string (4자리 숫자, 해시 저장)
name: string
created_at: timestamp
updated_at: timestamp
```

### 10.3 courses

```sql
course_id: UUID (PK)
instructor_id: UUID (FK → instructors)
course_name: string
course_code: string (예: "KPP101")
team_size: integer (2-6, default: 4)
weight_profile: enum (balanced, skill_heavy, skill_role_focused, diversity_heavy)
deadline: timestamp
status: enum (OPEN, LOCKED, CONFIRMED)
created_at: timestamp
updated_at: timestamp
```

### 10.4 students

```sql
student_id: UUID (PK)
course_id: UUID (FK → courses)
student_number: string(9) -- course 내 UNIQUE
pin_hash: string (4자리 숫자, 해시 저장)
name: string
email: string
major: enum (MPP, MDP, MPM, MDS, MIPD, MPPM, PhD)
gender: enum (male, female, other)
continent: enum (asia, africa, europe, north_america, south_america, oceania)
role: enum (leader, executor, ideator, coordinator)
skill: enum (data_analysis, research, writing, visual, presentation)
times: string[] (다중 선택)
goal: enum (a_plus, balanced, minimum)
team_id: UUID (FK → teams, nullable)
created_at: timestamp
updated_at: timestamp
```

### 10.5 teams

```sql
team_id: UUID (PK)
course_id: UUID (FK → courses)
team_number: integer (1, 2, 3...)
member_count: integer
score_total: decimal
score_time: decimal
score_skill: decimal
score_role: decimal
score_major: decimal
score_goal: decimal
score_continent: decimal
score_gender: decimal
top_factors: string[2] (설명용)
created_at: timestamp
```

---

## 11. UX Flow

### 11.1 관리자 Flow

```
1. 환경변수 계정으로 로그인
2. 교수자 계정 생성 (이메일 + 4자리 PIN)
3. 교수자에게 로그인 정보 안내
4. (필요시) 학생 PIN 리셋
5. (필요시) 코스 마감기한 변경
6. 전체 코스/매칭 현황 모니터링
```

### 11.2 교수자 Flow

```
1. Admin에게 받은 정보로 로그인
2. 새 코스 생성
   - 코스명, 코스코드 입력
   - 팀 인원수 설정
   - 가중치 프로파일 선택
   - 프로필 입력 마감기한 설정
3. 학생 접속 URL 복사 → 학생들에게 공유
4. 마감 후 "Run Matching" 실행
5. 팀 구성 + 점수 미리보기
6. "Confirm Teams" 클릭하여 확정
7. 학생들에게 결과 확인 안내
```

### 11.3 학생 Flow

```
1. 교수자가 공유한 URL 접속
2. 9자리 학번 입력
3. (최초) 4자리 PIN 설정
4. 프로필 8개 항목 입력 (이름, 이메일 포함)
5. 제출 → "매칭 대기중" 표시
6. (마감 전) 필요시 재접속하여 수정
7. (마감 후) 수정 불가, 조회만 가능
8. (매칭 확정 후) 팀 결과 확인
   - 팀원 이름, 전공, 이메일 표시
9. 팀원과 직접 연락 (카톡/WhatsApp 등)
```

---

## 12. API Endpoints

### 12.1 인증

```
POST /api/admin/login
POST /api/instructor/login
POST /api/student/auth        # 학번+PIN 검증 또는 신규등록
```

### 12.2 관리자

```
GET    /api/admin/instructors
POST   /api/admin/instructors
PUT    /api/admin/instructors/:id
DELETE /api/admin/instructors/:id
PUT    /api/admin/students/:id/reset-pin
GET    /api/admin/courses
PUT    /api/admin/courses/:id/deadline
```

### 12.3 교수자

```
GET  /api/instructor/courses
POST /api/instructor/courses
PUT  /api/instructor/courses/:id
GET  /api/instructor/courses/:id/students
POST /api/instructor/courses/:id/lock
POST /api/instructor/courses/:id/match
POST /api/instructor/courses/:id/confirm
GET  /api/instructor/courses/:id/teams
```

### 12.4 학생

```
GET  /api/student/profile
PUT  /api/student/profile
GET  /api/student/team
GET  /api/course/:uuid/status
```

---

## 13. Tech Stack

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | 자체 JWT |
| Deploy | Vercel |
| Styling | Tailwind CSS |

---

## 14. Security Considerations

### 14.1 비밀번호 저장
- 모든 PIN/비밀번호는 해시 처리하여 저장 (bcrypt)
- 평문 저장 금지

### 14.2 세션 관리
- JWT 토큰 기반 인증
- Admin 토큰: 4시간
- 교수자/학생 토큰: 24시간

### 14.3 접근 제어
- 학생: 본인 프로필 + 본인 팀만 접근
- 교수자: 본인 코스만 접근
- 관리자: 전체 접근

### 14.4 URL 보안
- 코스 접속 URL: UUID v4 기반 (추측 불가능)
- 예: `/course/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## 15. KPIs

| 지표 | 목표 |
|------|------|
| 낙오자(1인 팀) 발생 | **0건** |
| 매칭 수행시간 | ≤ 3초 |
| 학생 프로필 완료율 | ≥ 90% |
| 교수자 승인율 | ≥ 95% |
| 팀 간 점수 편차 | ≤ 10% |

---

## 16. Non-Goals (MVP 제외)

- ❌ 카카오톡/SMS/이메일 자동 알림
- ❌ LLM 기반 매칭 설명
- ❌ 교수자 셀프 회원가입
- ❌ 학생 PIN 셀프 리셋
- ❌ 수동 팀 멤버 Swap UI
- ❌ LMS 연동
- ❌ 심리 검사 기반 매칭

---

## 17. Development Phases

| Phase | 기간 | 내용 |
|-------|------|------|
| **1. Foundation** | Week 1 | 프로젝트 셋업, DB 스키마, 인증 (Admin/Instructor/Student) |
| **2. Core** | Week 2 | 학생 프로필 UI, 교수자 코스 관리, Admin 대시보드 |
| **3. Matching** | Week 3 | 알고리즘 구현, 점수 계산, 결과 표시 |
| **4. Polish** | Week 4 | UI/UX 개선, 테스트, 배포 |

---

## 18. Error Codes

| 코드 | 의미 |
|------|------|
| AUTH_001 | 잘못된 학번 형식 (9자리 숫자 아님) |
| AUTH_002 | 잘못된 PIN 형식 (4자리 숫자 아님) |
| AUTH_003 | 인증 실패 |
| COURSE_001 | 코스를 찾을 수 없음 |
| COURSE_002 | 프로필 입력 마감됨 |
| MATCH_001 | 매칭 실행 불가 (학생 부족) |
| MATCH_002 | 이미 매칭 확정됨 |

---

## Appendix A: Weight Profile Details

### Balanced (기본)
모든 요소를 균형있게 고려. 범용적 팀 구성에 적합.

### Skill-heavy
5가지 역량(Data Analysis, Research, Writing, Visual, Presentation)의 균형 배치를 최우선. 연구/분석 과제에 적합.

### Skill-Role-Focused
역량 균형과 역할 분배를 동시에 강조. 발표 비중이 높거나 역할 분담이 중요한 과제에 적합.

### Diversity-heavy
전공, 대륙, 성별 다양성 극대화. 글로벌 관점이 필요한 과제에 적합.

---

## Appendix B: Weight Profile Rationale

### 가중치 설계 원칙

| 가중치 범위 | 의미 |
|-------------|------|
| 4~5 | 핵심 요소 (맞지 않으면 협업 자체가 어려움) |
| 2~3 | 중요 요소 (팀 성과에 직접적 영향) |
| 1~1.5 | 보조 요소 (있으면 좋지만 필수는 아님) |

### Factor별 기본 가중치 근거

| Factor | 기본값 | 근거 |
|--------|--------|------|
| **Time** | 4 | 회의 시간이 안 맞으면 협업 자체가 불가능 |
| **Skill** | 3 | 역량이 골고루 있어야 과제 완성도 향상 |
| **Role** | 2 | 역할 분포가 팀 역학에 영향. 단, 유동적 조정 가능 |
| **Major** | 2 | 다양한 전공이 섞이면 관점이 풍부해짐 |
| **Continent** | 2 | KDI School 특성상 글로벌 관점 중요 |
| **Gender** | 1.5 | 다양성 고려하되, 과제 성과에 직접적 영향은 제한적 |
| **Goal** | 1 | 목표 성향이 다르면 갈등 가능성 있으나 대화로 조율 가능 |

---

**END OF DOCUMENT**

*이 문서는 TeamMatch MVP 개발의 Single Source of Truth(SOT)입니다.*  
*모든 구현은 이 문서를 기준으로 진행됩니다.*

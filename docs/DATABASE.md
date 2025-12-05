# 🗄️ DATABASE.md — TeamMatch 데이터베이스 설계

**참조:** PRD.md 섹션 10  
**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. Overview

| 항목 | 값 |
|------|-----|
| **Database** | Supabase (PostgreSQL 15+) |
| **Tables** | 4개 (instructors, courses, students, teams) |
| **Auth** | 자체 JWT (Supabase Auth 미사용) |
| **RLS** | 활성화 (API 레벨에서 추가 검증) |

---

## 2. Schema Diagram

```
┌─────────────────────┐
│    instructors      │
├─────────────────────┤
│ PK instructor_id    │──────┐
│    email (UNIQUE)   │      │
│    pin_hash         │      │
│    name             │      │
│    created_at       │      │
│    updated_at       │      │
└─────────────────────┘      │
                             │ 1:N
                             ▼
                    ┌─────────────────────┐
                    │      courses        │
                    ├─────────────────────┤
              ┌─────│ PK course_id        │─────┐
              │     │ FK instructor_id    │     │
              │     │    course_name      │     │
              │     │    course_code      │     │
              │     │    team_size        │     │
              │     │    weight_profile   │     │
              │     │    deadline         │     │
              │     │    status           │     │
              │     │    created_at       │     │
              │     │    updated_at       │     │
              │     └─────────────────────┘     │
              │                                 │
              │ 1:N                             │ 1:N
              ▼                                 ▼
    ┌─────────────────────┐           ┌─────────────────────┐
    │       teams         │           │      students       │
    ├─────────────────────┤           ├─────────────────────┤
    │ PK team_id          │◄──────────│ PK student_id       │
    │ FK course_id        │   N:1     │ FK course_id        │
    │    team_number      │           │ FK team_id (NULL)   │
    │    member_count     │           │    student_number   │
    │    score_total      │           │    pin_hash         │
    │    score_time       │           │    name             │
    │    score_skill      │           │    email            │
    │    score_role       │           │    major            │
    │    score_major      │           │    gender           │
    │    score_goal       │           │    continent        │
    │    score_continent  │           │    role             │
    │    score_gender     │           │    skill            │
    │    top_factors      │           │    times            │
    │    created_at       │           │    goal             │
    └─────────────────────┘           │    created_at       │
                                      │    updated_at       │
                                      └─────────────────────┘
```

---

## 3. Table Definitions

### 3.1 ENUM Types

```sql
-- 가중치 프로파일
CREATE TYPE weight_profile_enum AS ENUM (
  'balanced',
  'skill_heavy',
  'skill_role_focused',
  'diversity_heavy'
);

-- 코스 상태
CREATE TYPE course_status_enum AS ENUM (
  'OPEN',
  'LOCKED',
  'CONFIRMED'
);

-- 전공
CREATE TYPE major_enum AS ENUM (
  'MPP',
  'MDP',
  'MPM',
  'MDS',
  'MIPD',
  'MPPM',
  'PhD'
);

-- 성별
CREATE TYPE gender_enum AS ENUM (
  'male',
  'female',
  'other'
);

-- 대륙
CREATE TYPE continent_enum AS ENUM (
  'asia',
  'africa',
  'europe',
  'north_america',
  'south_america',
  'oceania'
);

-- 역할
CREATE TYPE role_enum AS ENUM (
  'leader',
  'executor',
  'ideator',
  'coordinator'
);

-- 역량
CREATE TYPE skill_enum AS ENUM (
  'data_analysis',
  'research',
  'writing',
  'visual',
  'presentation'
);

-- 시간대
CREATE TYPE time_enum AS ENUM (
  'weekday_daytime',
  'weekday_evening',
  'weekend'
);

-- 목표 성향
CREATE TYPE goal_enum AS ENUM (
  'a_plus',
  'balanced',
  'minimum'
);
```

### 3.2 instructors 테이블

```sql
CREATE TABLE instructors (
  instructor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,  -- bcrypt 해시
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_instructors_email ON instructors(email);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.3 courses 테이블

```sql
CREATE TABLE courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  course_name VARCHAR(200) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 4 CHECK (team_size >= 2 AND team_size <= 6),
  weight_profile weight_profile_enum NOT NULL DEFAULT 'balanced',
  deadline TIMESTAMPTZ NOT NULL,
  status course_status_enum NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_deadline ON courses(deadline);

-- 트리거
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.4 teams 테이블

```sql
CREATE TABLE teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  score_total DECIMAL(10,2) DEFAULT 0,
  score_time DECIMAL(10,2) DEFAULT 0,
  score_skill DECIMAL(10,2) DEFAULT 0,
  score_role DECIMAL(10,2) DEFAULT 0,
  score_major DECIMAL(10,2) DEFAULT 0,
  score_goal DECIMAL(10,2) DEFAULT 0,
  score_continent DECIMAL(10,2) DEFAULT 0,
  score_gender DECIMAL(10,2) DEFAULT 0,
  top_factors TEXT[] DEFAULT '{}',  -- 상위 2개 요소
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, team_number)
);

-- 인덱스
CREATE INDEX idx_teams_course ON teams(course_id);
```

### 3.5 students 테이블

```sql
CREATE TABLE students (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
  student_number VARCHAR(9) NOT NULL,  -- 9자리 학번
  pin_hash VARCHAR(255) NOT NULL,  -- bcrypt 해시
  
  -- 프로필 필드
  name VARCHAR(100),
  email VARCHAR(255),
  major major_enum,
  gender gender_enum,
  continent continent_enum,
  role role_enum,
  skill skill_enum,
  times time_enum[] DEFAULT '{}',  -- 다중 선택
  goal goal_enum,
  
  -- 메타
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 코스 내 학번 유니크
  UNIQUE(course_id, student_number)
);

-- 인덱스
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_team ON students(team_id);
CREATE INDEX idx_students_number ON students(student_number);

-- 트리거
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 4. Row Level Security (RLS)

### 4.1 RLS 활성화

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
```

### 4.2 Service Role 정책

> **Note:** API Routes에서 Service Role Key 사용 시 RLS 우회.
> 실제 접근 제어는 API 레벨에서 JWT 검증으로 수행.

```sql
-- Service Role은 모든 작업 허용 (API Routes용)
CREATE POLICY "Service role full access on instructors"
  ON instructors FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on courses"
  ON courses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on teams"
  ON teams FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on students"
  ON students FOR ALL
  USING (auth.role() = 'service_role');
```

### 4.3 Anonymous 정책 (선택적)

```sql
-- 코스 상태 조회 (학생 URL 접속 시)
CREATE POLICY "Anyone can check course status"
  ON courses FOR SELECT
  USING (true);  -- course_id로 조회, 민감 정보 없음
```

---

## 5. Database Functions

### 5.1 마감 시 자동 상태 변경

```sql
-- 마감 시간 도래 시 OPEN → LOCKED
CREATE OR REPLACE FUNCTION auto_lock_courses()
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET status = 'LOCKED'
  WHERE status = 'OPEN'
    AND deadline <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Cron Job 또는 API 호출로 주기적 실행
-- Supabase에서는 pg_cron 확장 사용 가능
```

### 5.2 팀 멤버 수 동기화

```sql
-- 팀 멤버 수 자동 계산
CREATE OR REPLACE FUNCTION sync_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 이전 팀 멤버 수 갱신
  IF OLD.team_id IS NOT NULL THEN
    UPDATE teams
    SET member_count = (
      SELECT COUNT(*) FROM students WHERE team_id = OLD.team_id
    )
    WHERE team_id = OLD.team_id;
  END IF;
  
  -- 새 팀 멤버 수 갱신
  IF NEW.team_id IS NOT NULL THEN
    UPDATE teams
    SET member_count = (
      SELECT COUNT(*) FROM students WHERE team_id = NEW.team_id
    )
    WHERE team_id = NEW.team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_team_sync
  AFTER UPDATE OF team_id ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_member_count();
```

### 5.3 프로필 완료 체크

```sql
-- 프로필 완료 여부 자동 체크
CREATE OR REPLACE FUNCTION check_profile_completed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completed := (
    NEW.name IS NOT NULL AND
    NEW.email IS NOT NULL AND
    NEW.major IS NOT NULL AND
    NEW.gender IS NOT NULL AND
    NEW.continent IS NOT NULL AND
    NEW.role IS NOT NULL AND
    NEW.skill IS NOT NULL AND
    array_length(NEW.times, 1) > 0 AND
    NEW.goal IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_profile_check
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completed();
```

---

## 6. Sample Queries

### 6.1 교수자 코스 목록 조회

```sql
SELECT 
  c.course_id,
  c.course_name,
  c.course_code,
  c.status,
  c.deadline,
  COUNT(s.student_id) AS student_count,
  COUNT(s.student_id) FILTER (WHERE s.profile_completed) AS completed_count
FROM courses c
LEFT JOIN students s ON c.course_id = s.course_id
WHERE c.instructor_id = $1
GROUP BY c.course_id
ORDER BY c.created_at DESC;
```

### 6.2 코스 학생 목록 조회

```sql
SELECT 
  s.student_id,
  s.student_number,
  s.name,
  s.email,
  s.major,
  s.profile_completed,
  t.team_number
FROM students s
LEFT JOIN teams t ON s.team_id = t.team_id
WHERE s.course_id = $1
ORDER BY s.student_number;
```

### 6.3 팀별 결과 조회 (교수자용)

```sql
SELECT 
  t.team_id,
  t.team_number,
  t.member_count,
  t.score_total,
  t.score_time,
  t.score_skill,
  t.score_role,
  t.score_major,
  t.score_goal,
  t.score_continent,
  t.score_gender,
  t.top_factors,
  json_agg(json_build_object(
    'name', s.name,
    'email', s.email,
    'major', s.major,
    'role', s.role,
    'skill', s.skill
  )) AS members
FROM teams t
JOIN students s ON t.team_id = s.team_id
WHERE t.course_id = $1
GROUP BY t.team_id
ORDER BY t.team_number;
```

### 6.4 학생 팀 결과 조회

```sql
-- 본인 팀 정보 + 팀원 정보 (이름, 전공, 이메일만)
SELECT 
  t.team_number,
  t.top_factors,
  json_agg(json_build_object(
    'name', s2.name,
    'major', s2.major,
    'email', s2.email
  )) AS teammates
FROM students s
JOIN teams t ON s.team_id = t.team_id
JOIN students s2 ON t.team_id = s2.team_id
WHERE s.student_id = $1
GROUP BY t.team_id;
```

---

## 7. Migration Scripts

### 7.1 초기 마이그레이션 (001_init.sql)

```sql
-- 001_init.sql
-- TeamMatch 초기 스키마

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
-- (섹션 3.1의 모든 ENUM 정의)

-- Tables
-- (섹션 3.2~3.5의 모든 테이블 정의)

-- Functions & Triggers
-- (섹션 5의 모든 함수 및 트리거)

-- RLS
-- (섹션 4의 모든 정책)

-- Indexes
-- (각 테이블의 인덱스)
```

### 7.2 Seed 데이터 (개발용)

```sql
-- seed.sql
-- 개발/테스트용 샘플 데이터

-- 테스트 교수자
INSERT INTO instructors (email, pin_hash, name)
VALUES ('test.instructor@kdischool.ac.kr', '$2b$10$...', 'Test Instructor');

-- 테스트 코스
INSERT INTO courses (instructor_id, course_name, course_code, deadline)
SELECT 
  instructor_id,
  'Test Course',
  'TEST101',
  NOW() + INTERVAL '7 days'
FROM instructors
WHERE email = 'test.instructor@kdischool.ac.kr';
```

---

## 8. Backup & Recovery

### 8.1 백업 전략

| 유형 | 주기 | 보관 기간 |
|------|------|----------|
| Point-in-Time | 연속 (Supabase 기본) | 7일 |
| Daily Snapshot | 매일 | 30일 |

### 8.2 복구 절차

```bash
# Supabase 대시보드에서:
# 1. Database > Backups
# 2. 원하는 시점 선택
# 3. Restore 실행
```

---

## 9. Performance Optimization

### 9.1 쿼리 최적화 팁

```sql
-- ❌ 나쁜 예: 서브쿼리 반복
SELECT *, (SELECT COUNT(*) FROM students WHERE course_id = c.course_id) AS cnt
FROM courses c;

-- ✅ 좋은 예: JOIN 사용
SELECT c.*, COUNT(s.student_id) AS cnt
FROM courses c
LEFT JOIN students s ON c.course_id = s.course_id
GROUP BY c.course_id;
```

### 9.2 인덱스 사용 확인

```sql
-- 쿼리 실행 계획 확인
EXPLAIN ANALYZE
SELECT * FROM students WHERE course_id = $1 AND profile_completed = true;
```

---

## 10. Monitoring

### 10.1 주요 모니터링 지표

| 지표 | 임계값 | 액션 |
|------|--------|------|
| Connection Count | > 80% | 풀 사이즈 증가 |
| Query Time | > 1s | 쿼리 최적화 |
| Table Size | > 1GB | 파티셔닝 검토 |

### 10.2 Supabase 대시보드

```
Database > Reports > Query Performance
- Slowest queries
- Most frequent queries
- Index usage
```

---

**END OF DOCUMENT**

*이 문서는 PRD.md 섹션 10을 기반으로 한 데이터베이스 상세 설계입니다.*

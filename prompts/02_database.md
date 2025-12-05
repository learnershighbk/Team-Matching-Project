# 🗄️ 02_database.md — 데이터베이스 설정

**순서:** 2/8  
**의존성:** 01_setup.md  
**다음:** 03_auth_backend.md

---

## 🎯 Mission

Supabase에 TeamMatch 데이터베이스 스키마를 생성합니다.
ENUM 타입, 테이블, 인덱스, 트리거, RLS 정책을 설정합니다.

---

## 📋 Tasks

### Task 1: Supabase 프로젝트 설정

1. Supabase Dashboard에서 새 프로젝트 생성
2. Project Settings > API에서 키 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`
3. `.env.local`에 값 설정

### Task 2: ENUM 타입 생성

SQL Editor에서 실행:

```sql
-- 가중치 프로파일
CREATE TYPE weight_profile_enum AS ENUM (
  'balanced', 'skill_heavy', 'skill_role_focused', 'diversity_heavy'
);

-- 코스 상태
CREATE TYPE course_status_enum AS ENUM ('OPEN', 'LOCKED', 'CONFIRMED');

-- 전공
CREATE TYPE major_enum AS ENUM (
  'MPP', 'MDP', 'MPM', 'MDS', 'MIPD', 'MPPM', 'PhD'
);

-- 성별
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- 대륙
CREATE TYPE continent_enum AS ENUM (
  'asia', 'africa', 'europe', 'north_america', 'south_america', 'oceania'
);

-- 역할
CREATE TYPE role_enum AS ENUM ('leader', 'executor', 'ideator', 'coordinator');

-- 역량
CREATE TYPE skill_enum AS ENUM (
  'data_analysis', 'research', 'writing', 'visual', 'presentation'
);

-- 시간대
CREATE TYPE time_enum AS ENUM ('weekday_daytime', 'weekday_evening', 'weekend');

-- 목표 성향
CREATE TYPE goal_enum AS ENUM ('a_plus', 'balanced', 'minimum');
```

### Task 3: 테이블 생성

```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- instructors 테이블
CREATE TABLE instructors (
  instructor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_instructors_email ON instructors(email);

CREATE TRIGGER instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- courses 테이블
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

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_deadline ON courses(deadline);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- teams 테이블
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
  top_factors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, team_number)
);

CREATE INDEX idx_teams_course ON teams(course_id);

-- students 테이블
CREATE TABLE students (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
  student_number VARCHAR(9) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255),
  major major_enum,
  gender gender_enum,
  continent continent_enum,
  role role_enum,
  skill skill_enum,
  times time_enum[] DEFAULT '{}',
  goal goal_enum,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, student_number)
);

CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_team ON students(team_id);
CREATE INDEX idx_students_number ON students(student_number);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Task 4: 프로필 완료 자동 체크 트리거

```sql
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
  FOR EACH ROW EXECUTE FUNCTION check_profile_completed();
```

### Task 5: RLS 정책 설정

```sql
-- RLS 활성화
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Service Role 전체 접근 (API Routes에서 사용)
CREATE POLICY "Service role full access" ON instructors
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON courses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON teams
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON students
  FOR ALL USING (auth.role() = 'service_role');
```

### Task 6: Supabase 클라이언트 설정

**파일:** `lib/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**파일:** `lib/supabase/server.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### Task 7: Seed 데이터 (개발용)

```sql
-- 테스트 교수자 (PIN: 1234, hash는 bcrypt로 생성 필요)
-- 실제로는 API를 통해 생성

-- 개발 시 테스트용 데이터는 API 또는 스크립트로 생성
```

---

## ✅ Checklist

- [ ] Supabase 프로젝트 생성됨
- [ ] API 키가 .env.local에 설정됨
- [ ] 모든 ENUM 타입 생성됨
- [ ] 4개 테이블 생성됨 (instructors, courses, teams, students)
- [ ] 인덱스 생성됨
- [ ] 트리거 작동 (updated_at, profile_completed)
- [ ] RLS 정책 설정됨
- [ ] Supabase 클라이언트 코드 작성됨

---

## 🧪 Verification

```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- ENUM 확인
SELECT typname FROM pg_type WHERE typtype = 'e';

-- 트리거 확인
SELECT trigger_name, event_object_table 
FROM information_schema.triggers;
```

---

## 🔗 Reference

- docs/DATABASE.md
- docs/PRD.md 섹션 10

---

## ➡️ Next Step

03_auth_backend.md로 진행하여 인증 API를 구현합니다.

# 🗄️ Database Agent

**역할:** 데이터베이스 스키마, 쿼리, RLS 정책 관리

---

## 🎯 Mission

Supabase PostgreSQL 데이터베이스의 스키마 설계, 쿼리 최적화, 보안 정책을 관리합니다.

---

## 📂 담당 영역

```
supabase/
├── migrations/
│   ├── 001_create_enums.sql
│   ├── 002_create_tables.sql
│   ├── 003_create_triggers.sql
│   └── 004_create_rls.sql
└── seed.sql

lib/
├── supabase/
│   ├── client.ts (브라우저용)
│   └── server.ts (서버용)
└── db/
    └── queries.ts (공통 쿼리)
```

---

## 🛠️ Technical Stack

- **Database:** PostgreSQL (Supabase)
- **Client:** @supabase/supabase-js
- **Features:** RLS, Triggers, Functions

---

## 📊 Schema Overview

### ENUM Types (9개)
```sql
weight_profile_enum, course_status_enum, major_enum,
gender_enum, continent_enum, role_enum, skill_enum,
time_enum, goal_enum
```

### Tables (4개)

#### instructors
| Column | Type | Constraints |
|--------|------|-------------|
| instructor_id | UUID | PK, DEFAULT uuid |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| pin_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | AUTO UPDATE |

#### courses
| Column | Type | Constraints |
|--------|------|-------------|
| course_id | UUID | PK, DEFAULT uuid |
| instructor_id | UUID | FK → instructors |
| course_name | VARCHAR(200) | NOT NULL |
| course_code | VARCHAR(20) | NOT NULL |
| team_size | INTEGER | CHECK 2-6 |
| weight_profile | ENUM | DEFAULT 'balanced' |
| deadline | TIMESTAMPTZ | NOT NULL |
| status | ENUM | DEFAULT 'OPEN' |

#### teams
| Column | Type | Constraints |
|--------|------|-------------|
| team_id | UUID | PK |
| course_id | UUID | FK → courses |
| team_number | INTEGER | NOT NULL |
| member_count | INTEGER | DEFAULT 0 |
| score_* | DECIMAL(10,2) | 7개 점수 |
| top_factors | TEXT[] | DEFAULT '{}' |

#### students
| Column | Type | Constraints |
|--------|------|-------------|
| student_id | UUID | PK |
| course_id | UUID | FK → courses |
| team_id | UUID | FK → teams, NULLABLE |
| student_number | VARCHAR(9) | NOT NULL |
| pin_hash | VARCHAR(255) | NOT NULL |
| profile fields | Various | NULLABLE |
| profile_completed | BOOLEAN | AUTO CALC |
| UNIQUE | (course_id, student_number) |

---

## 📋 Implementation Guidelines

### Supabase Client Setup

```typescript
// lib/supabase/client.ts (브라우저)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabase/server.ts (서버)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Query Patterns

```typescript
// SELECT with JOIN
const { data, error } = await supabaseAdmin
  .from('courses')
  .select(`
    *,
    instructor:instructors(name),
    students:students(count)
  `)
  .eq('instructor_id', id);

// INSERT with RETURNING
const { data, error } = await supabaseAdmin
  .from('students')
  .insert({ course_id, student_number, pin_hash })
  .select()
  .single();

// UPDATE
const { error } = await supabaseAdmin
  .from('courses')
  .update({ status: 'LOCKED' })
  .eq('course_id', id);

// COUNT
const { count } = await supabaseAdmin
  .from('students')
  .select('*', { count: 'exact', head: true })
  .eq('course_id', id)
  .eq('profile_completed', true);
```

### Triggers

```sql
-- updated_at 자동 갱신
CREATE TRIGGER [table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- profile_completed 자동 계산
CREATE TRIGGER students_profile_check
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION check_profile_completed();
```

### RLS Policies

```sql
-- Service Role 전체 접근
CREATE POLICY "Service role full access" ON [table]
  FOR ALL USING (auth.role() = 'service_role');
```

---

## ✅ Checklist

### Schema
- [ ] 9개 ENUM 타입 생성
- [ ] 4개 테이블 생성
- [ ] 인덱스 설정
- [ ] 외래키 관계

### Triggers
- [ ] updated_at 자동 갱신
- [ ] profile_completed 자동 계산

### Security
- [ ] RLS 활성화
- [ ] Service Role 정책

### Client
- [ ] 브라우저 클라이언트
- [ ] 서버 클라이언트 (Admin)

---

## 🔗 Reference

- docs/DATABASE.md
- docs/PRD.md 섹션 10
- prompts/02_database.md

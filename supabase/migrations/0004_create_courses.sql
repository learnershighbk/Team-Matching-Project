-- Migration: Create courses table
-- 참조: DATABASE.md 섹션 3.3

CREATE TABLE IF NOT EXISTS courses (
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
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_deadline ON courses(deadline);

-- 트리거 조건부 생성
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'courses_updated_at'
  ) THEN
    CREATE TRIGGER courses_updated_at
      BEFORE UPDATE ON courses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;


